import { View } from 'react-native';
import { Camera, CameraType, FaceDetectionResult } from 'expo-camera';
import { styles } from './styles';
import { useEffect, useState } from 'react';
import * as FaceDetector from 'expo-face-detector';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
// import { GLView } from 'expo-gl';
// import * as tf from '@tensorflow/tfjs';
// import * as faceLandmarksDetection from '../assets/models';


export function Home() {
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [faceDetected, setFaceDetected] = useState(false);
    const [emoji, setEmoji] = useState('😐');

    const faceValues = useSharedValue({
        width: 0,
        height: 0,
        x: 0,
        y: 0,
    });

    const animatedStyle = useAnimatedStyle(() => ({
        position: 'absolute',
        zIndex: 1,
        width: faceValues.value.width,
        height: faceValues.value.height,
        transform: [
            { translateX: faceValues.value.x },
            { translateY: faceValues.value.y },
        ],
        borderColor: 'green',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        
    }));

    useEffect(() => {
        requestPermission();
    }, []);

    if (!permission?.granted) {
        return;
    }

    function handleFacesDetected({faces}: FaceDetectionResult) {
        // console.log(faces);
        const face = faces[0] as any;

        if (face) {
            const {
                size, origin
            } = face.bounds;

            faceValues.value = {
                width: size.width,
                height: size.height,
                x: origin.x,
                y: origin.y,
            }

            setFaceDetected(true);

            if(face.smilingProbability > 0.7) {
                setEmoji('😁');
            } else if (face.leftEyeOpenProbability < 0.1 && face.rightEyeOpenProbability > 0.7) {
                setEmoji('😉');
            } else if (face.leftEyeOpenProbability < 0.1) {
                setEmoji('😴');
            } else {
                setEmoji('😐');
            }

        } else {
            setFaceDetected(false);
        }
    }

    return (
        <View style={styles.container}>
            {faceDetected 
                && <Animated.Text style={animatedStyle}>
                    {emoji}
                </Animated.Text>
            }
            <Camera 
                style={styles.camera}
                type={CameraType.front} 
                onFacesDetected={handleFacesDetected}
                faceDetectorSettings={{
                    mode: FaceDetector.FaceDetectorMode.fast,
                    detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
                    runClassifications: FaceDetector.FaceDetectorClassifications.all,
                    minDetectionInterval: 100,
                    tracking: true,
                }}
            />
        </View>
    );
}