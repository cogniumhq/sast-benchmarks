using System.IO;
using Microsoft.AspNetCore.Mvc;
public class FilesController : Controller {
  public IActionResult Read() {
    var name = Request.Query["name"];
    var content = File.ReadAllText(Path.Combine("/data", name));
    return Content(content);
  }
}