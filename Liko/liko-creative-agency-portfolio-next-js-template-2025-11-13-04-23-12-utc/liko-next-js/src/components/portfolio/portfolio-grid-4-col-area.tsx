import React from "react";
import { UpArrow } from "../svg";
import Image from "next/image";
import Link from "next/link";
import portfolio_data from "@/data/portfolio-data";

// prop type 
type IProps = {
  style_2?: boolean;
}

export default function PortfolioGridFourColArea({ style_2 = false }: IProps) {
  return (
    <div className="tp-project-5-2-area tp-project-5-2-pt pb-130">
      <div className={`container container-${style_2 ? '1800' : '1530'}`}>
        <div className="row">
          {portfolio_data.slice(0, 8).map((item) => (
            <div key={item.id} className="col-xl-3 col-lg-6 col-md-6">
              <div className="tp-project-5-2-thumb mb-30 p-relative not-hide-cursor" data-cursor="View<br>Demo">
                <Link href="/portfolio-details-2" className="tp_img_reveal cursor-hide">
                  <div className="tp_img_reveal">
                    <Image
                      src={item.img}
                      alt="prd-img"
                      style={{ width: "100%", height: "auto" }}
                    />
                  </div>
                  <div className="tp-project-5-2-category tp_fade_anim">
                    <span>{item.category}</span>
                  </div>
                  <div className="tp-project-5-2-content tp_fade_anim">
                    <span className="tp-project-5-2-meta">{item.year}</span>
                    <h4 className="tp-project-5-2-title-sm">{item.title}</h4>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-projct-5-2-btn-box mt-50 d-flex justify-content-center">
              <div className="tp-hover-btn-wrapper">
                <Link
                  className="tp-btn-circle style-2 tp-hover-btn-item tp-hover-btn"
                  href="/portfolio-grid-col-2"
                >
                  <span className="tp-btn-circle-text">
                    More <br /> Projects
                  </span>
                  <span className="tp-btn-circle-icon">
                    <UpArrow />
                  </span>
                  <i className="tp-btn-circle-dot"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
