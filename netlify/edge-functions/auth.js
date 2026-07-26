export default async (request, context) => {
  const expectedUser = Netlify.env.get("BASIC_AUTH_USER");
  const expectedPass = Netlify.env.get("BASIC_AUTH_PASS");

  // Only enforce basic authentication if both environment variables are set in Netlify site settings
  if (expectedUser && expectedPass) {
    const authHeader = request.headers.get("authorization");

    if (authHeader) {
      try {
        const base64Credentials = authHeader.split(" ")[1];
        const [username, password] = atob(base64Credentials).split(":");

        if (username === expectedUser && password === expectedPass) {
          return context.next(); // Credentials match! Proceed to the site.
        }
      } catch (err) {
        console.error("Error decoding authorization header:", err);
      }
    }

    // Trigger native browser HTTP Basic Auth login prompt
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="ONS SPP Prototype Secure Area"',
      },
    });
  }

  // If environment variables are not configured, allow public access
  return context.next();
};
