use rocket::get;
use std::process::Command;

#[get("/exec/<cmd>")]
fn execute(cmd: String) -> String {
    let output = Command::new(&cmd)
        .output()
        .expect("Failed");
    format!("{:?}", output)
}
