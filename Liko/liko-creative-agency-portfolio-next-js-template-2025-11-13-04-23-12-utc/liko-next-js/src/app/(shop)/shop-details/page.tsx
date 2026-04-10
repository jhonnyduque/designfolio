
import ShopDetailsMain from '@/pages/shop/shop-details-main';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: "Liko - Shop Details page",
};

const page = () => {
    return (
        <ShopDetailsMain id={1}/>
    );
};

export default page;