
'use client';
import { useState, useEffect, useRef } from 'react';
import $ from "jquery";

const useStickyHeader = (offset = 20) => {
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);

 useEffect(() => {
    const setHeaderHeight = headerRef.current?.offsetHeight;

    if (setHeaderHeight) {
      const headerElements = document.querySelectorAll<HTMLDivElement>('.tp-header-height');
      headerElements.forEach(element => {
        element.style.height = `${setHeaderHeight}px`;
      });
    }
  }, []);

    function adjustMenuBackground() {
    if ($('.tp-header-3-area').length > 0) {
      const menuBox = $('.tp-header-3-menu-box');
      const menuBoxWidth = menuBox.width()!;
      const menuBoxHeight = menuBox.height()!;
      $('.menu-bg').css({
        'width': menuBoxWidth + 46,
        'height': menuBoxHeight,
        'left': menuBox.offset()!.left
      })
    }
  }

   function headerFullWidth () {
    const menuElements = document.querySelectorAll(".tp-menu-fullwidth");
    menuElements.forEach((element: Element) => {
      const previousDiv = element.parentElement?.parentElement;
      if (previousDiv) {
        previousDiv.classList.add("has-homemenu");
      }
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > offset);
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [offset]);



  return {isSticky, headerFullWidth, adjustMenuBackground, headerRef};
};

export default useStickyHeader;