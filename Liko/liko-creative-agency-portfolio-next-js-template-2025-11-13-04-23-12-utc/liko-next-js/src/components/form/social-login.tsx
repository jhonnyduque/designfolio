import React from "react";
import Image from "next/image";
import google from "@/assets/img/login/google.svg";
import facebook from "@/assets/img/login/facebook.svg";
import apple from "@/assets/img/login/apple.svg";
import Link from "next/link";

export default function SocialLogin() {
  return (
    <div className="tp-login-social mb-10 d-flex flex-wrap align-items-center justify-content-center">
      <div className="tp-login-option-item has-google">
        <Link href="#">
          <Image src={google} alt="google" />
          Sign in with google
        </Link>
      </div>
      <div className="tp-login-option-item">
        <Link href="#">
          <Image src={facebook} alt="facebook" />
        </Link>
      </div>
      <div className="tp-login-option-item">
        <Link href="#">
          <Image src={apple} alt="apple" className="apple" />
        </Link>
      </div>
    </div>
  );
}
