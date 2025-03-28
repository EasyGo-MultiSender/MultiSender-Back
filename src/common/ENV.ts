import jetEnv, { num, str } from "jet-env";
import { isEnumVal } from "jet-validators";
import dotenv from "dotenv";

import { NodeEnvs } from "./constants";

/******************************************************************************
                                 Setup
******************************************************************************/

dotenv.config({ path: "./config/.env" });

const ENV = jetEnv({
  NodeEnv: isEnumVal(NodeEnvs),
  Port: num,
  RecaptchaSiteKey: str,
  RecaptchaSecretKey: str,
  RecaptchaScoreThreshold: num,
});

/******************************************************************************
                            Export default
******************************************************************************/

export default ENV;
