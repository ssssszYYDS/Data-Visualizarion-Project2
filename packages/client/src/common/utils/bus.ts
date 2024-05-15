import mitt from 'mitt'
type Events = {
    participantID: number
    labelID: number
    time: string
}
const bus = mitt<Events>()
export default bus