
import team_data from '@/data/team-data';
import TeamDetailsMain from '@/pages/team/team-details';
import { PageParamsProps } from '@/types/custom-d-t';
import React from 'react';

export async function generateMetadata(props: PageParamsProps) {
    const resolvedParams = await props.params;
    const { id } = resolvedParams;
    const team = team_data.find((team) => team.id == Number(id));
    return {
        title: team?.name ? team.name : "Team Details",
    };
}

export default async function BlogDetails(props: PageParamsProps) {
    const resolvedParams = await props.params;
    const { id } = resolvedParams;

    return (
        <TeamDetailsMain id={id} />
    );
}


