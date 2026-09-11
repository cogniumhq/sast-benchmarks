using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.AspNetCore.Mvc;
public class EvalController : Controller {
  public async System.Threading.Tasks.Task<IActionResult> Run() {
    var expr = Request.Form["expr"];
    var result = await CSharpScript.EvaluateAsync(expr);
    return Ok(result);
  }
}