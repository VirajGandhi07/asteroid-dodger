using System.Text.Json;
using BackendApi.Data;

namespace BackendApi.Middleware;

/// <summary>
/// Global exception handling middleware for standardized error responses
/// </summary>
public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Unhandled exception: {ex.Message}");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ErrorResponse(
            StatusCode: context.Response.StatusCode,
            Message: "An error occurred while processing your request",
            Details: exception.Message
        );

        // Determine status code based on exception type
        switch (exception)
        {
            case ArgumentNullException:
            case ArgumentException:
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                response = new ErrorResponse(
                    StatusCode: StatusCodes.Status400BadRequest,
                    Message: "Bad request",
                    Details: exception.Message
                );
                break;

            case KeyNotFoundException:
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                response = new ErrorResponse(
                    StatusCode: StatusCodes.Status404NotFound,
                    Message: "Resource not found",
                    Details: exception.Message
                );
                break;

            case UnauthorizedAccessException:
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                response = new ErrorResponse(
                    StatusCode: StatusCodes.Status401Unauthorized,
                    Message: "Unauthorized",
                    Details: exception.Message
                );
                break;

            default:
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                response = new ErrorResponse(
                    StatusCode: StatusCodes.Status500InternalServerError,
                    Message: "Internal server error",
                    Details: exception.Message
                );
                break;
        }

        return context.Response.WriteAsJsonAsync(response);
    }
}
