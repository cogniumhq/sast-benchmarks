using System.DirectoryServices;
using Microsoft.AspNetCore.Mvc;
public class DirController : Controller {
  public IActionResult Find() {
    var uid = Request.Query["uid"];
    var searcher = new DirectorySearcher();
    searcher.Filter = "(uid=" + uid + ")";
    searcher.FindOne();
    return Ok();
  }
}