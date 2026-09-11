using System.Xml;
using System.IO;
using Microsoft.AspNetCore.Mvc;
public class XmlController : Controller {
  public IActionResult Parse() {
    var body = new StreamReader(Request.Body).ReadToEnd();
    var doc = new XmlDocument();
    doc.LoadXml(body);
    return Ok();
  }
}