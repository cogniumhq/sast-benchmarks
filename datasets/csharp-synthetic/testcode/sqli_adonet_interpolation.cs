using System.Data.SqlClient;
using Microsoft.AspNetCore.Mvc;
public class UserController : Controller {
  public IActionResult Get([FromQuery] string name) {
    var cmd = new SqlCommand($"SELECT * FROM users WHERE name = '{name}'", new SqlConnection("cs"));
    cmd.ExecuteReader();
    return Ok();
  }
}