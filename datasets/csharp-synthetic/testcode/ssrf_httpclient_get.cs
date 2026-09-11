using System.Net.Http;
using Microsoft.AspNetCore.Mvc;
public class ProxyController : Controller {
  private static readonly HttpClient http = new HttpClient();
  public async System.Threading.Tasks.Task<IActionResult> Fetch() {
    var url = Request.Query["url"];
    var resp = await http.GetAsync(url);
    return Content(await resp.Content.ReadAsStringAsync());
  }
}