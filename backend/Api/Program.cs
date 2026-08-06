using System.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);
DotNetEnv.Env.Load();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddHttpClient();
builder.Services.AddOpenApi();

var app = builder.Build();
app.UseCors("AllowAngularApp");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapPost("/api/cat-chat", async (ChatRequest request, HttpClient httpClient) =>
{
    var apiKey = Environment.GetEnvironmentVariable("API_KEY");

    var messagesList = new List<object>
    {
        new
        {
            role = "system",
            content =
                "You are a cat on a dating site. You are slightly arrogant, very hungry, and often weave the word 'meow' into your replies. Keep your answers short and concise. Please response the language that question is based"
        }
    };
    var userMessages = request.History.Select(msg => new
    {
        role = "user",
        content = msg
    });
    
    messagesList.AddRange(userMessages);
    
    var openApiPayload = new
    {
        model = "llama-3.1-8b-instant",
        messages = messagesList
    };

    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

    var response = await httpClient.PostAsJsonAsync(
        "https://api.groq.com/openai/v1/chat/completions", 
        openApiPayload
    );
    if (!response.IsSuccessStatusCode)
    {
        var errorText = await response.Content.ReadAsStringAsync();
        Console.WriteLine(errorText);
        return Results.BadRequest(new { reply = "smoke gum man" });
    }
    var clearText = await response.Content.ReadFromJsonAsync<AiResponse>();
    if (clearText is null) return Results.Ok(new { reply = "lol" });
    var text = clearText.Choices[0].Message.Content;
    return Results.Ok(new { reply = text });
});

app.Run();

public record ChatRequest(List<string> History);
public record AiResponse(List<Choice> Choices);
public record Choice(Message Message);
public record Message(string Content);