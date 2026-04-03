import React from 'react';
import { Button } from 'antd';
import classNames from 'classnames';

/**
 * BrandButton - A standardized button component following the AutoPane AI design system.
 * 
 * @param {('primary'|'secondary'|'default'|'dashed'|'link'|'text')} type - Ant Design button type
 * @param {('gradient'|'solid'|'outline'|'ghost')} variant - Design system variant
 * @param {Boolean} block - Full width button
 * @param {('small'|'middle'|'large')} size - Button size
 */
const BrandButton = ({ 
    children, 
    type = 'primary', 
    variant = 'gradient', 
    size = 'large', 
    className, 
    style,
    ...props 
}) => {
    // Determine the base classes based on the variant
    const variantClasses = classNames({
        'brand-gradient brand-button-premium !text-white !border-none !shadow-md': variant === 'gradient',
        '!bg-[#7E5CFE] hover:!bg-[#6b47e8] !text-white !border-none !shadow-md hover:!shadow-lg hover:-translate-y-0.5': variant === 'solid',
        '!bg-transparent !border-2 !border-[#7E5CFE] !text-[#7E5CFE] hover:!bg-violet-50': variant === 'outline',
        'hover:!bg-slate-50 !text-slate-600 !border-none shadow-sm': variant === 'ghost',
        '!bg-white !text-[#7E5CFE] !border-none hover:!bg-slate-50': variant === 'white',
    });

    // Default premium shadow/transition
    const baseStyle = {
        borderRadius: '12px', // default brand rounding for auth/UI, can be overridden via className
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        ...style
    };

    return (
        <Button
            type={type}
            size={size}
            className={classNames(variantClasses, className)}
            style={baseStyle}
            {...props}
        >
            {children}
        </Button>
    );
};

export default BrandButton;
