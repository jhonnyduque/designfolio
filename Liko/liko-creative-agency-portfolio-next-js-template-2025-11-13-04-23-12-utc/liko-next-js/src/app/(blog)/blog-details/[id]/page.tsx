import { blog_data } from '@/data/blog-data';
import BlogDetailsMain from '@/pages/blog/blog-details';
import { PageParamsProps } from '@/types/custom-d-t';
import React from 'react';

export async function generateMetadata(props: PageParamsProps) {
    const resolvedParams = await props.params;
    const { id } = resolvedParams;
    const blog = blog_data.find((blog) => blog.id == Number(id));
    return {
        title: blog?.title ? blog.title : "Blog Details",
    };
}

export default async function BlogDetailsPage(props: PageParamsProps) {
    const resolvedParams = await props.params;
    const { id } = resolvedParams;

    return (
        <BlogDetailsMain id={id} />
    );
}


