import defineAuthenticatedEventHandler from "./define-authenticated-event-handler";

type AuthenticatedHandler<T> = Parameters<typeof defineAuthenticatedEventHandler<T>>[0];

export default function defineAdminEventHandler<T>(
  handler: AuthenticatedHandler<T>,
) {
  return defineAuthenticatedEventHandler((event) => {
    if (event.context.user.role !== "admin") {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
      });
    }

    return handler(event);
  });
}
