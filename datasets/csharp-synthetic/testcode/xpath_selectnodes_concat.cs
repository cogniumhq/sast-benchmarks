using System.Xml;
using Microsoft.AspNetCore.Mvc;
public class XmlController : Controller {
  public IActionResult Find() {
    var name = Request.Query["name"];
    var doc = new XmlDocument();
    doc.Load("users.xml");
    var nodes = doc.SelectNodes("/users/user[@name='" + name + "']");
    return Ok(nodes);
  }
}