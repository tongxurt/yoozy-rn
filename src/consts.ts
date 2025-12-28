
export const workflowConfig: Record<string, any> = {
    VideoReplication: {
        label: '视频复刻',
    },
    VideoReplication2: {
        label: '视频复刻',
    },
    VideoGeneration: {
        label: '创意视频生成',
    }
}

export const assetWorkflowJobConfig = {
    videoGenerationJob: {
        label: '视频生成',
        status: {
            waiting: {
                name: '视频生成等待中',
                color: 'text-gray-500',
                bg: 'bg-gray-50'
            },
            running: {
                name: '视频生成运行中',
                color: 'text-blue-500',
                bg: 'bg-blue-50'
            },
            confirming: {
                name: '视频生成确认中',
                color: 'text-yellow-500',
                bg: 'bg-yellow-50'
            },
            completed: {
                name: '视频生成完成',
                color: 'text-green-500',
                bg: 'bg-green-50'
            },
        },
        dataKey: 'videoGenerations'
    },
    keyFramesGenerationJob: {
        label: '关键帧生成',
        status: {
            waiting: {
                name: '关键帧生成等待中',
                color: 'text-gray-500',
                bg: 'bg-gray-50'
            },
            running: {
                name: '关键帧生成运行中',
                color: 'text-blue-500',
                bg: 'bg-blue-50'
            },
            confirming: {
                name: '关键帧生成确认中',
                color: 'text-yellow-500',
                bg: 'bg-yellow-50'
            },
            completed: {
                name: '关键帧生成完成',
                color: 'text-green-500',
                bg: 'bg-green-50'
            },
        },
        dataKey: 'keyFrames'
    },
    segmentScriptJob: {
        label: '片段脚本生成',
        status: {
            waiting: {
                name: '片段脚本生成等待中',
                color: 'text-gray-500',
                bg: 'bg-gray-50'
            },
            running: {
                name: '片段脚本生成运行中',
                color: 'text-blue-500',
                bg: 'bg-blue-50'
            },
            confirming: {
                name: '片段脚本生成确认中',
                color: 'text-yellow-500',
                bg: 'bg-yellow-50'
            },
            completed: {
                name: '片段脚本生成完成',
                color: 'text-green-500',
                bg: 'bg-green-50'
            },
        },
        dataKey: 'segmentScript'
    },
    commodityReplacementJob: {
        label: '商品替换',
        status: {
            waiting: {
                name: '商品替换等待中',
                color: 'text-gray-500',
                bg: 'bg-gray-50'
            },
            running: {
                name: '商品替换运行中',
                color: 'text-blue-500',
                bg: 'bg-blue-50'
            },
            confirming: {
                name: '商品替换确认中',
                color: 'text-yellow-500',
                bg: 'bg-yellow-50'
            },
            completed: {
                name: '商品替换完成',
                color: 'text-green-500',
                bg: 'bg-green-50'
            },
        },
        dataKey: 'videoFramesChanges'
    },
    videoSegmentsGenerationJob: {
        label: '片段复刻',
        status: {
            waiting: {
                name: '片段复刻等待中',
                color: 'text-gray-500',
                bg: 'bg-gray-50'
            },
            running: {
                name: '片段复刻运行中',
                color: 'text-blue-500',
                bg: 'bg-blue-50'
            },
            confirming: {
                name: '片段复刻确认中',
                color: 'text-yellow-500',
                bg: 'bg-yellow-50'
            },
            completed: {
                name: '片段复刻完成',
                color: 'text-green-500',
                bg: 'bg-green-50'
            },
        },
        dataKey: 'videoGenerations'
    },
    videoSegmentsRemixJob: {
        label: '片段混剪',
        status: {
            waiting: {
                name: '片段混剪等待中',
                color: 'text-gray-500',
                bg: 'bg-gray-50'
            },
            running: {
                name: '片段混剪运行中',
                color: 'text-blue-500',
                bg: 'bg-blue-50'
            },
            confirming: {
                name: '片段混剪确认中',
                color: 'text-yellow-500',
                bg: 'bg-yellow-50'
            },
            completed: {
                name: '片段混剪完成',
                color: 'text-green-500',
                bg: 'bg-green-50'
            },
        },
        dataKey: 'segmentsRemix'
    }
}
