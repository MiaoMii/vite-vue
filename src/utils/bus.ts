import mitt from "mitt";

const bus = mitt();

const chartEvent = [
    {
        id: [1],
        eventType: ["change"],
        condition: [[
            {filed: "name", operator: "==", value: "1"},
        ]],
        actionType: ["sysChangeData"],
        target: [[1, 2]],
    },
    {
        id: [2],
        eventType: ["change"],
        condition: [[
            {filed: "name", operator: "==", value: "1"},
        ]],
        actionType: ["sysChangeData"],
        target: [[2, 3]],
    }
]

// const union = (arr1: any, arr2: any) => {
//     return  [...arr1, ...arr2].reduce((acc, curr) => {
//         if (!acc.includes(curr)) {
//             acc.push(curr);
//         }
//         return acc;
//     }, []);
// }

chartEvent.map((item: any) => {
    item.logotype = []
    item.target.map((ta: any,t: number) => {
        item.logotype[t]= []
        ta.map((it: string|number) => {
            item.logotype[t].push(`${item['eventType'][t]}${item['actionType'][t]}${it}`)
            }
        )
    })
})

const spEventArr: any = {} as any
const helpArr = {} as any

(bus as any).sendMessage = ({data, eventType, currentEvent, source}: any) => {
    console.log(eventType, source)
    for (let i = 0; i <  currentEvent["logotype"].length; i++) {
        currentEvent["logotype"][i].map(((it: any) => {
            if(spEventArr[it] === undefined) spEventArr[it] = []
            if( helpArr[it] === undefined) helpArr[it] = []

        }))
    }


    // 如果发起事件相同 接受点事件相同 目标相同则需要特殊处理
    chartEvent.map((event: any) => {
        for (let i = 0; i < event["logotype"].length; i++) {
            event["logotype"][i].map((it: any, j: number) => {
                if(spEventArr.hasOwnProperty(it)){
                    if(!helpArr[it].includes(event["id"][i])) {
                        const temp:any = {}
                        for (const key in event) {
                            if(currentEvent["id"][i] === event["id"][i]){
                                temp["dispatch"] = true
                                temp["data"] = data
                            }
                            temp[key] = event[key][i]
                            if(key === "target"){
                                temp[key] = [event[key][i][j]]
                            }
                        }
                        helpArr[it].push(event["id"][i])
                        spEventArr[it].push(temp)
                    }else {
                        // 更新状态
                        if(currentEvent["id"][i] === event["id"][i] && spEventArr[it].length !== 0){
                            const index = helpArr[it].indexOf(event["id"][i])
                            spEventArr[it][index]["dispatch"] = true
                        }

                        // const index = helpArr[it].indexOf(event["id"][i])
                        // if(index !== -1){
                        //     spEventArr[it][index] = temp
                        // }
                    }
                    // helpArr[it].in
                    // const isPush =  helpArr[it].every((sit: any) => sit.id)
                }
            })

        }
    })
    console.log(helpArr)
    console.log(spEventArr)

    for (const key in spEventArr) {
        if(spEventArr[key].length > 1){
            // 表示全触发了 可以发送消息了
            const allDispatch = spEventArr[key].every((it:any) => it.dispatch)
            if(allDispatch){
                bus.emit(spEventArr[key][0]["actionType"])
                delete spEventArr[key]
                delete helpArr[key]
            }
        }else {
            delete spEventArr[key]
        }
    }

    // spEventArr.filter((it: any) => it.length > 1).map((it:any) => {
    //     const flag = it.every((it:any) => it.dispatch)
    //     debugger
    // })
}


export default bus;
