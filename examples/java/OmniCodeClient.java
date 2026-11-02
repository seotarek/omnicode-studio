// OmniCode Studio - Java 11+ HTTP Client Integration
package studio.omnicode.examples;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class OmniCodeClient {
    private final String baseUrl;
    private final String apiKey;
    private final HttpClient httpClient;

    public OmniCodeClient(String baseUrl, String apiKey) {
        this.baseUrl = baseUrl.replaceAll("/+$", "");
        this.apiKey = apiKey;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public String generateQr(String data, String ecLevel, int size) throws Exception {
        String json = String.format("{\"data\":\"%s\",\"ecLevel\":\"%s\",\"size\":%d}", data, ecLevel, size);
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/v1/generate/qr"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json));

        if (apiKey != null && !apiKey.isEmpty()) {
            builder.header("x-api-key", apiKey);
        }

        HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    public static void main(String[] args) {
        OmniCodeClient client = new OmniCodeClient("http://localhost:8080", null);
        System.out.println("OmniCode Java Client Initialized.");
    }
}
