import useTailwindVars from "@/hooks/useTailwindVars";
import React from "react";
import {
    Text
} from "react-native";

interface VideoGenerationJobProps {
    job: any;
    asset: any;
    refetch: () => void;
}

const VideoGenerationJob = ({ job, asset, refetch }: VideoGenerationJobProps) => {
    const { colors } = useTailwindVars();

    const data = asset?.workflow?.dataBus?.videoGenerations;

    return <Text>{JSON.stringify(data)}</Text>

};

export default VideoGenerationJob;
