import useTailwindVars from "@/hooks/useTailwindVars";
import React from "react";
import {
    Text
} from "react-native";

interface JobProps {
    job: any;
    asset: any;
    refetch: () => void;
}

const Job = ({ job, asset, refetch }: JobProps) => {
    const { colors } = useTailwindVars();

    const data = asset?.workflow?.dataBus?.segmentScript;

    return <Text>{JSON.stringify(data)}</Text>
};

export default Job;

