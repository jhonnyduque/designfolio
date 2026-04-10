import ShopDetailsMain from '@/pages/shop/shop-details-main';
import { PageParamsProps } from '@/types/custom-d-t';
import product_data from '@/data/product-data';
import React from 'react';

export async function generateMetadata(props: PageParamsProps) {
    const resolvedParams = await props.params;
    const { id } = resolvedParams;
    const product = product_data.find((item) => item.id == Number(id));
    return {
        title: product?.title ? product.title : "product Details",
    };
}

export default async function ProductDetails(props: PageParamsProps) {
    const resolvedParams = await props.params;
    const { id } = resolvedParams;
    
    return (
        <ShopDetailsMain id={id} />
    );
}