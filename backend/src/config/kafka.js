import {Kafka} from 'kafkajs';


export const kafka=new Kafka({
    clientId: 'airport-tracker',
    brokers: ['172.19.185.55:9092']
}   
)

export const producer=kafka.producer();
export const consumer=kafka.consumer({groupId:'airport-tracker-group'})


export async function connectkafka(){
    try{
        await producer.connect();
        console.log("Kafka producer connected");

        await consumer.connect();
        console.log('Kafka consumer airport-tracker-group connected')
    }catch(err){
        console.log("Kafka connection error",err);
    }
}