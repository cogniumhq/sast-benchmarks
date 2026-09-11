using System.Data.SqlClient;
using Microsoft.AspNetCore.Mvc;
public class UserController : Controller {
  public IActionResult Get() {
    var id = Request.Query["id"];
    var cmd = new SqlCommand("SELECT * FROM users WHERE id = " + id, new SqlConnection("cs"));
    cmd.ExecuteReader();
    return Ok();
  }
}