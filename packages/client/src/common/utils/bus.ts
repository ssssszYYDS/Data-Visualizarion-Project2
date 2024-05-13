import mitt from 'mitt'
type Events = {
    participantID: number
    labelID: number
}
const bus = mitt<Events>()
export default bus