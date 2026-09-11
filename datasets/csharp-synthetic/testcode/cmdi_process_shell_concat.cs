using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
public class OpsController : Controller {
  public IActionResult Ping() {
    var host = Request.Form["host"];
    Process.Start("cmd.exe", "/c ping " + host);
    return Ok();
  }
}