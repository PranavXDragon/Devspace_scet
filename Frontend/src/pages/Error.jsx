import React from "react";
import { Link, useRouteError } from "react-router-dom";
import contentData from "../data/content.json";

const GlobalError = () => {
  const error = useRouteError();
  const { error: errorContent } = contentData;

  const status = error?.status || 404;
  const message = error?.statusText || errorContent.defaultMessage;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 transition-colors bg-bg text-text">
      <h1 className="text-[6rem] font-extrabold bg-clip-text text-transparent animate-bounce bg-gradient-to-r from-accent to-ink">
        {status}
      </h1>

      <p className="mt-3 text-xl font-medium text-center max-w-xs text-text-text-muted">
        {message}
      </p>

      <div className="mt-6 w-24 h-24 flex items-center justify-center rounded-full shadow-md animate-pulse bg-accent/20 border border-accent/30 shadow-[0_4px_6px_rgba(46,197,212,0.25)]">
        <span className="text-4xl">😢</span>
      </div>

      <Link
        to="/"
        className="mt-6 px-6 py-2 font-semibold rounded-lg shadow-md hover:scale-105 active:scale-95 transition-transform duration-200 bg-text text-bg shadow-[0_4px_6px_rgba(46,197,212,0.25)]"
      >
        {errorContent.buttonText}
      </Link>
    </div>
  );
};

export default GlobalError;
