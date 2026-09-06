import React from "react";
import { Link } from "react-router-dom";

const Button = ({
  children,
  to,
  href,
  onClick,
  variant = "solid",
  className = "",
  ...props
}) => {
  const baseStyle = "inline-flex items-center w-full lg:w-fit justify-center min-h-[3.25rem] px-[1.5rem] py-[0.9rem] border font-sans text-[0.96rem] tracking-[0.2em] uppercase transition-all duration-150 rounded-lg";
  const variantStyle =
    variant === "outline" ? "bg-transparent text-text border-border hover:border-accent hover:text-accent" : "bg-text text-bg border-transparent hover:bg-text-muted hover:text-bg hover:-translate-y-[1px]";
  const combinedClasses = `${baseStyle} ${variantStyle} ${className}`.trim();
  if (to) {
    return (
      <Link to={to} className={combinedClasses} {...props}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={combinedClasses} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
