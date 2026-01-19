import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  let errorMessage = "An unexpected error occurred";
  let errorStatus = "Error";

  if (isRouteErrorResponse(error)) {
    errorStatus = `${error.status}`;
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-heading text-primary mb-4">{errorStatus}</h1>
        <p className="text-xl font-paragraph text-primary/70 mb-8">{errorMessage}</p>
        <Link
          to="/"
          className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-paragraph hover:bg-primary/90 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
