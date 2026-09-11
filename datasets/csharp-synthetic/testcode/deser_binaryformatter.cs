using System.Runtime.Serialization.Formatters.Binary;
using Microsoft.AspNetCore.Mvc;
public class ImportController : Controller {
  public IActionResult Import() {
    var bf = new BinaryFormatter();
    var obj = bf.Deserialize(Request.Body);
    return Ok(obj);
  }
}