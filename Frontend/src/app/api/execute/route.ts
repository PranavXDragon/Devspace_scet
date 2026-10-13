import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

interface ExecuteRequest {
  code: string;
  language: string;
  input?: string;
}

// Judge0 Language IDs for Sandboxed Cloud Execution
const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  javascript: 93, // Node.js 18.15.0
  typescript: 94, // TypeScript 5.0.3
  python: 71,     // Python 3.8.1
  java: 91,       // Java JDK 17.0.6
  c: 103,         // C GCC 14.1.0
  'c++': 54,      // C++ GCC 9.2.0
  cpp: 54,
  rust: 73,       // Rust 1.40.0
  php: 98,        // PHP 8.3.11
  ruby: 72,       // Ruby 2.7.0
  kotlin: 78,     // Kotlin 1.3.70
  r: 99,          // R 4.4.1
  bash: 46,       // Bash 5.0.0
  'c#': 51,       // C# Mono 6.6.0
  csharp: 51,
  go: 95,         // Go 1.18.5
};

interface LanguageConfig {
  extension: string;
  command: string;
  args: (...args: string[]) => string[];
  runCommand?: string | ((path: string) => string);
  runArgs?: (arg: string) => string[];
  needsCompilation?: boolean;
  needsProject?: boolean;
}

// Local fallback configurations
const languageConfigs: Record<string, LanguageConfig> = {
  javascript: {
    extension: '.js',
    command: 'node',
    args: (filePath: string) => [filePath],
  },
  typescript: {
    extension: '.ts',
    command: 'tsx',
    args: (filePath: string) => [filePath],
  },
  python: {
    extension: '.py',
    command: process.platform === 'win32' ? 'python' : 'python3',
    args: (filePath: string) => [filePath],
  },
  java: {
    extension: '.java',
    command: 'javac',
    args: (filePath: string) => [filePath],
    runCommand: 'java',
    runArgs: (className: string) => [className],
    needsCompilation: true,
  },
  c: {
    extension: '.c',
    command: 'gcc',
    args: (filePath: string, outputPath: string) => [filePath, '-o', outputPath],
    runCommand: (outputPath: string) => outputPath,
    needsCompilation: true,
  },
  'c++': {
    extension: '.cpp',
    command: 'g++',
    args: (filePath: string, outputPath: string) => [filePath, '-o', outputPath, '-std=c++14'],
    runCommand: (outputPath: string) => outputPath,
    needsCompilation: true,
  },
  rust: {
    extension: '.rs',
    command: 'rustc',
    args: (filePath: string, outputPath: string) => [filePath, '-o', outputPath],
    runCommand: (outputPath: string) => outputPath,
    needsCompilation: true,
  },
  php: {
    extension: '.php',
    command: 'php',
    args: (filePath: string) => [filePath],
  },
  ruby: {
    extension: '.rb',
    command: 'ruby',
    args: (filePath: string) => [filePath],
  },
  kotlin: {
    extension: '.kt',
    command: 'kotlinc',
    args: (filePath: string, outputPath: string) => [filePath, '-include-runtime', '-d', outputPath],
    runCommand: 'java',
    runArgs: (jarPath: string) => ['-jar', jarPath],
    needsCompilation: true,
  },
  r: {
    extension: '.r',
    command: 'Rscript',
    args: (filePath: string) => [filePath],
  },
  bash: {
    extension: '.sh',
    command: 'bash',
    args: (filePath: string) => [filePath],
  },
};

function executeCommand(command: string, args: string[], cwd?: string, input?: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const process = spawn(command, args, { 
      cwd,
      shell: true,
      timeout: 15000,
    });
    
    let stdout = '';
    let stderr = '';
    
    if (input && process.stdin) {
      process.stdin.write(input);
      process.stdin.end();
    }
    
    process.stdout?.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr?.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      resolve({ stdout, stderr, exitCode: code || 0 });
    });
    
    process.on('error', (error) => {
      if (error.message.includes('ENOENT')) {
        resolve({ 
          stdout, 
          stderr: `Error: Command '${command}' not found on server runtime.`, 
          exitCode: 127 
        });
      } else {
        resolve({ stdout, stderr: error.message, exitCode: 1 });
      }
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const { code, language, input }: ExecuteRequest = await request.json();
    
    if (!code || !language) {
      return NextResponse.json(
        { error: ['Code and language are required'], output: [], success: false },
        { status: 400 }
      );
    }
    
    const normLang = language.toLowerCase().trim();

    // 1. Primary: Judge0 Sandboxed Cloud Execution
    const judge0Id = JUDGE0_LANGUAGE_IDS[normLang];
    if (judge0Id) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const b64Source = Buffer.from(code, 'utf8').toString('base64');
        const b64Stdin = input ? Buffer.from(input, 'utf8').toString('base64') : '';

        const judgeRes = await fetch('https://ce.judge0.com/submissions?wait=true&base64_encoded=true', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source_code: b64Source,
            language_id: judge0Id,
            stdin: b64Stdin,
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (judgeRes.ok) {
          const data = await judgeRes.json();
          
          const decodeB64 = (str?: string | null) => {
            if (!str) return '';
            try {
              return Buffer.from(str, 'base64').toString('utf8');
            } catch (e) {
              return str;
            }
          };

          const rawStdout = decodeB64(data.stdout);
          const rawStderr = decodeB64(data.stderr);
          const compileOutput = decodeB64(data.compile_output);
          const message = decodeB64(data.message);

          const outputLines = rawStdout.split('\n').filter((l: string) => l.trim() !== '');
          const errorLines = [
            ...compileOutput.split('\n'),
            ...rawStderr.split('\n'),
            ...message.split('\n')
          ].filter((l: string) => l.trim() !== '');

          const isSuccess = data.status?.id === 3; // 3 = Accepted

          return NextResponse.json({
            output: outputLines,
            error: errorLines,
            success: isSuccess
          });
        } else {
          console.warn('Judge0 returned non-200 status:', judgeRes.status);
        }
      } catch (judgeErr) {
        console.warn('Judge0 execution fallback:', judgeErr);
      }
    }

    // In serverless environments (Vercel), only Node.js is available. Do not attempt missing binaries for C++, Python, Java.
    if ((process.env.VERCEL || process.env.NODE_ENV === 'production') && normLang !== 'javascript') {
      return NextResponse.json({
        output: [],
        error: [`Compiler sandbox for ${language} is temporarily busy. Please wait 5 seconds and click Run again.`],
        success: false
      });
    }

    // 2. Secondary: Local System Execution Fallback
    const config = languageConfigs[normLang];
    if (!config) {
      return NextResponse.json(
        { error: [`Language '${language}' is not supported`], output: [], success: false },
        { status: 400 }
      );
    }
    
    const tempDir = join(tmpdir(), `codepad_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    mkdirSync(tempDir, { recursive: true });
    
    try {
      const fileName = `main${config.extension}`;
      const filePath = join(tempDir, fileName);
      writeFileSync(filePath, code);
      
      let result: { stdout: string; stderr: string; exitCode: number };
      
      if (config.needsCompilation) {
        const outputPath = join(tempDir, process.platform === 'win32' ? 'main.exe' : 'main');
        const compileArgs = config.args(filePath, outputPath);
        result = await executeCommand(config.command, compileArgs, tempDir);
        
        if (result.exitCode !== 0) {
          return NextResponse.json({
            error: result.stderr.split('\n').filter(line => line.trim()),
            output: [],
            success: false
          });
        }
        
        const runCmd = typeof config.runCommand === 'function' ? config.runCommand(outputPath) : (config.runCommand || outputPath);
        result = await executeCommand(runCmd, [], tempDir, input);
      } else {
        const args = config.args(filePath);
        result = await executeCommand(config.command, args, tempDir, input);
      }
      
      const output = result.stdout.split('\n').filter(line => line.trim());
      const error = result.stderr.split('\n').filter(line => line.trim());
      
      return NextResponse.json({
        output,
        error,
        success: result.exitCode === 0
      });
      
    } finally {
      try {
        if (existsSync(tempDir)) {
          rmSync(tempDir, { recursive: true, force: true });
        }
      } catch (cleanupError) {}
    }
    
  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json(
      { 
        error: ['Internal execution error: ' + (error instanceof Error ? error.message : 'Unknown error')], 
        output: [], 
        success: false 
      },
      { status: 500 }
    );
  }
}

