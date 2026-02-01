
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Stage, OrbitControls } from '@react-three/drei';
import suvModel from '../../assets/low_poly_suv.glb';

function Model(props) {
    const { scene } = useGLTF(suvModel);
    return <primitive object={scene} {...props} />;
}

const CarModelViewer = () => {
    return (
        <div className="w-full h-[500px] bg-gray-50 rounded-xl overflow-hidden cursor-move">
            <Canvas shadows dpr={[1, 2]} camera={{ fov: 50, position: [4, 2, 4] }}>
                <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.6}>
                        <Model scale={0.01} />
                    </Stage>
                </Suspense>
                <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} />
            </Canvas>
        </div>
    );
};

export default CarModelViewer;
