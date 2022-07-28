const user_config = require("../config/user_config.json");
function mailResetPasswordOtp(otp) {
    return `
        <div style="width:100%;text-align:center;">
          <div style="font-size:23px;font-weight:900;font-family:monospace;padding:20px 10px;letter-spacing:1px;">Placement Prediction & Management System</div>
          <div style="background:url('${user_config.NETIMAGES.OTP}') no-repeat center;background-size:cover;height:400px;">
            <div style="font-family:sans-serif;font-size:30px;color:#FFF;font-weight:900;letter-spacing:1px;padding:110px 0px;">Reset Password</div>
          </div>
          <div style="width:100%;height:auto;min-height:400px;background:#212121;color:#FFF;padding:50px 20px;box-sizing:border-box;">
            <div><div style="font-family:sans-serif;font-size:15px;box-sizing:border-box;width:auto;display:inline-block;margin:50px 0px;padding:10px 50px;color:#000;background:#2196F3;border-radius:5px;">Your OTP is valid for ${user_config.OTP.TIMEOUT} minutes</div></div>
            <div style="font-family:sans-serif;margin:10px 0px;color:#FFF;font-size:16px;">Your OTP is</div>
            <div><span style="font-family:sans-serif;font-size:30px;color:#FFF;font-weight:900;letter-spacing:1px;">${otp}</span></div>
            <div style="margin-top:45px;font-family:sans-serif;font-size:15px;color:#000;background:#E91E63;display:inline-block;padding:8px 15px;border-radius:50px;">Do not share your OTP with anybody.</div>
          </div>
          <div>
            <div style="font-size:16px;font-weight:900;font-family:monospace;padding:20px 10px;letter-spacing:1px;color:#000;">Developed By</div>
            <div style="display:flex;font-size:16px;font-weight:900;font-family:monospace;letter-spacing:1px;color:#000">
              <div style="padding:20px 10px;margin:0px auto;">Anisha</div>
              <div style="padding:20px 10px;margin:0px auto;">Glorina</div>
              <div style="padding:20px 10px;margin:0px auto;">Rahul</div>
            </div>
          </div>
          <div style="color:#000;padding:20px 0px;text-align:center;font-size:20px;letter-spacing:1px;background:linear-gradient(135deg,#64B5F6,#0D47A1)">Have a nice day !!!</div>
        </div>
    `;
}
module.exports = mailResetPasswordOtp;
