// OmniCode Studio - .NET / C# Client Integration
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace OmniCode.Examples
{
    public class OmniCodeClient
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;

        public OmniCodeClient(string baseUrl = "http://localhost:8080", string apiKey = null)
        {
            _baseUrl = baseUrl.TrimEnd('/');
            _httpClient = new HttpClient();
            if (!string.IsNullOrEmpty(apiKey))
            {
                _httpClient.DefaultRequestHeaders.Add("x-api-key", apiKey);
            }
        }

        public async Task<string> GenerateQrAsync(string data, string ecLevel = "H", int size = 360)
        {
            var payload = new { data, ecLevel, size };
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"{_baseUrl}/api/v1/generate/qr", content);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }

        public async Task<string> GenerateBarcodeAsync(string format, string data, string style = "classic")
        {
            var payload = new { format, data, style };
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"{_baseUrl}/api/v1/generate/barcode", content);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }
    }

    class Program
    {
        static void Main()
        {
            var client = new OmniCodeClient("http://localhost:8080");
            Console.WriteLine("OmniCode .NET Client Initialized.");
        }
    }
}
