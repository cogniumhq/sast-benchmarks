using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
public class OpsController : Controller {
  public IActionResult Ping() {
    var host = Request.Form["host"];
    var psi = new ProcessStartInfo("ping");
    psi.ArgumentList.Add(host);
    Process.Start(psi);
    return Ok();
  }
}