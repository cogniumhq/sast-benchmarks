using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Mvc;
public class PageController : Controller {
  public async System.Threading.Tasks.Task Render() {
    var q = Request.Query["q"];
    await Response.WriteAsync("<div>" + HtmlEncoder.Default.Encode(q) + "</div>");
  }
}