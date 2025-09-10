import { useContext } from 'react';
import { SocketContext } from '../components/io/Io';

export default function useSocket() {
    return useContext(SocketContext);
}