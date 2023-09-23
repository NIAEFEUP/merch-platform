import { StatusCodes as HTTPStatus } from "http-status-codes";
import express, { Router } from "express";
import https from "https";
import { credentials } from "./env.js";

// route: <site>/validate?user=202108774
// sigarra api: https://sigarra.up.pt/<institution>/<lang>/mob_fest_geral.perfil?pv_codigo=<up>

const app = express();
const router = Router();

router.get("/", async (req, res) => {
  const institution = req.query.institution;
  const user = req.query.user;

  if (isNaN(user)) {
    return res.status(HTTPStatus.BAD_REQUEST).json({
      institution: institution,
      user: user,
      message: "Invalid user number",
    });
  }

  // Login to Sigarra, or use cookies if already logged in
  const url_login = new URL(
    `https://sigarra.up.pt/${institution}/pt/vld_validacao.validacao`
  );

  const options_login = {
    hostname: url_login.hostname,
    path: url_login.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: JSON.stringify({
      p_app: 162,
      p_amo: 1705,
      p_user: credentials.username,
      p_pass: credentials.password,
    }),
  };

  let cookies;
  const login_req = https.request(options_login, (res) => {
    for (const element in res) {
      console.log(element);
    }
    console.log(res.rawHeaders);
    res.on("data", () => {
      console.log(res.headers["set-cookie"]);
      cookies = {
        SI_SECURITY: res.cookies.SI_SECURITY?.value,
        SI_SESSION: res.cookies.SI_SESSION?.value,
      };
    });
  });

  login_req.on("error", (error) => {
    //throw res.status(HTTPStatus.FORBIDDEN).json({ message: error.message });
  });

  login_req.end();

  console.log("COOKEIIIEISOJEISIESIE");
  console.log(cookies);

  // Get student information
  const url_student = new URL(
    `https://sigarra.up.pt/${institution}/pt/mob_fest_geral.perfil?pv_codigo=${user}`
  );
  const options_student = {
    hostname: url_student.hostname,
    port: 443,
    path: url_student.pathname,
    method: "GET",
    headers: {
      Cookie: `SI_SECURITY=${cookies?.SI_SECURITY}; SI_SESSION=${cookies?.SI_SESSION}`,
    },
  };

  let student;
  const get_info_req = https.request(options_student, (res) => {
    res.on("end", () => {
      student = res;
    });
  });

  get_info_req.on("error", (error) => {
    return res.status(HTTPStatus.FORBIDDEN).json({ message: error.message });
  });

  get_info_req.end();
  console.log(student);
  return res.status(HTTPStatus.OK).json({ message: "OK" });

  const courses = student.cursos.map((course) => course.fest_id);

  return courses;
});

app.use("/validate", router);
app.listen(8080, () => {
  console.log("Server running on port 8080");
});
