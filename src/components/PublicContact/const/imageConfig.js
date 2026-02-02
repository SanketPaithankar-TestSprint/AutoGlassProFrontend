
import sunroofSvg from '../../../assets/sunroof.svg';
import frontWindshieldSvg from '../../../assets/front-wind-shield.svg';
import frontVentGlassSvg from '../../../assets/front-vent-glass.svg';
import frontDoorGlassSvg from '../../../assets/front-door-glass.svg';
import rearDoorGlassSvg from '../../../assets/rear-door-glass.svg';
import rearVentGlassSvg from '../../../assets/rear-vent-glass.svg';
import rearWindshieldSvg from '../../../assets/Rear-Windshield.svg';
import rearQuarterGlassSvg from '../../../assets/rear-quarter-glass.svg';

export const GLASS_OVERLAYS = [
    {
        id: 'sunroof',
        src: sunroofSvg,
        alt: 'Sunroof pointer',
        className: 'w-45 h-22 absolute pointer-events-none opacity-0 group-hover:opacity-90 transition-opacity duration-300',
        style: { top: '18%', left: '40%', transform: 'translateX(-50%)' }
    },
    {
        id: 'front-windshield',
        src: frontWindshieldSvg,
        alt: 'Front windshield pointer',
        className: 'w-40 h-20 absolute pointer-events-none opacity-0 group-hover:opacity-90 transition-opacity duration-300',
        style: { top: '25%', left: '25%', transform: 'translateX(-50%)' }
    },
    {
        id: 'rear-quarter-glass',
        src: rearQuarterGlassSvg,
        alt: 'Rear quarter glass pointer',
        className: 'w-40 h-20 absolute pointer-events-none opacity-0 group-hover:opacity-90 transition-opacity duration-300',
        style: { top: '25%', left: '110%', transform: 'translateX(-50%)' }
    },
    {
        id: 'front-vent-glass',
        src: frontVentGlassSvg,
        alt: 'Front vent glass pointer',
        className: 'w-80 h-25 rotate-[-90deg] absolute pointer-events-none opacity-0 group-hover:opacity-90 transition-opacity duration-300',
        style: { top: '22%', left: '20%', transform: 'translateX(-50%)' }
    },
    {
        id: 'rear-windshield',
        src: rearWindshieldSvg,
        alt: 'Rear windshield pointer',
        className: 'w-30 h-20 absolute pointer-events-none opacity-0 group-hover:opacity-90 transition-opacity duration-300',
        style: { top: '17%', left: '110%', transform: 'translateX(-50%)' }
    },
    {
        id: 'front-door-glass',
        src: frontDoorGlassSvg,
        alt: 'Front door glass pointer',
        className: 'w-80 h-25 rotate-[-90deg] absolute pointer-events-none opacity-0 group-hover:opacity-90 transition-opacity duration-300',
        style: { top: '13%', left: '30%', transform: 'translateX(-50%)' }
    },
    {
        id: 'rear-door-glass',
        src: rearDoorGlassSvg,
        alt: 'Rear door glass pointer',
        className: 'w-80 h-25 rotate-[-90deg] absolute pointer-events-none opacity-0 group-hover:opacity-90 transition-opacity duration-300',
        style: { top: '10%', left: '45%', transform: 'translateX(-50%)' }
    },
    {
        id: 'rear-vent-glass',
        src: rearVentGlassSvg,
        alt: 'Rear vent glass pointer',
        className: 'w-40 h-15 absolute pointer-events-none opacity-0 group-hover:opacity-90 transition-opacity duration-300',
        style: { top: '35%', left: '105%', transform: 'translateX(-50%)' }
    }
];
