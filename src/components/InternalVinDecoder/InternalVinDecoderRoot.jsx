import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip, Alert, Card, Input, Button, Select, Skeleton, Empty } from 'antd';

const { Option } = Select;

// ─── NHTSA API ────────────────────────────────────────────────────────────────
const NHTSA_BASE = 'https://vpic.nhtsa.dot.gov/api';

async function decodeVin(vin, modelYear = '') {
    const url = `${NHTSA_BASE}/vehicles/DecodeVinValuesExtended/${vin.trim()}?format=json${modelYear ? `&modelyear=${modelYear}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NHTSA API error: ${res.status}`);
    const json = await res.json();
    if (!json.Results?.length) throw new Error('No results returned');
    return json.Results[0];
}

const InternalVinDecoderRoot = () => {
    const { t } = useTranslation();
    
    const DATA_MAPPING = [
        { title: t('internalVinDecoder.coreIdentity'), fields: ['Make', 'Model', 'ModelYear', 'VehicleType', 'BodyClass', 'Series', 'Trim', 'Trim2'] },
        { title: t('internalVinDecoder.powertrain'), fields: ['EngineModel', 'EngineCylinders', 'DisplacementCC', 'DisplacementL', 'EngineHP', 'EngineKW', 'FuelTypePrimary', 'FuelTypeSecondary', 'DriveType', 'TransmissionStyle', 'TransmissionSpeeds'] },
        { title: t('internalVinDecoder.safetyDimensions'), fields: ['AirBagLocFront', 'AirBagLocSide', 'AirBagLocCurtain', 'AirBagLocKnee', 'TPMS', 'ESC', 'ABS', 'LaneDepartureWarning', 'ForwardCollisionWarning', 'DynamicBrakeSupport', 'Doors', 'Windows', 'WheelBaseLong', 'WheelBaseShort', 'TrackWidth', 'GVWR', 'Seats', 'SeatRows'] },
        { title: t('internalVinDecoder.origin'), fields: ['Manufacturer', 'PlantCity', 'PlantCountry', 'PlantState', 'OriginCountry'] },
    ];
    const [vin, setVin] = useState('');
    const [modelYear, setModelYear] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    const handleDecode = async (e) => {
        e?.preventDefault();
        const trimmed = vin.trim().toUpperCase();
        if (!trimmed) { inputRef.current?.focus(); return; }
        setLoading(true); setError(null); setResult(null);
        try {
            const data = await decodeVin(trimmed, modelYear);
            if (data.ErrorCode && data.ErrorCode !== '0') setError(data.ErrorText || 'NHTSA could not decode this VIN.');
            else { setResult(data); }
        } catch (err) { setError(err.message || 'Failed to decode VIN. Please try again.'); }
        finally { setLoading(false); }
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => currentYear - i);

    return (
        <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 bg-slate-100">
            <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <div className="flex items-center gap-2">
                        <h1 className="!text-[30px] font-extrabold text-slate-800 m-0">
                            {t('nav.vinDecoder') || 'VIN Decoder'}
                        </h1>
                        <Tooltip title={t('internalVinDecoder.decodeTooltip')} placement="right">
                            <InfoCircleOutlined className="text-slate-400 text-base cursor-pointer hover:text-violet-500 transition-colors" />
                        </Tooltip>
                    </div>
                </header>

                {error && (
                    <Alert
                        message={t('internalVinDecoder.decodingFailed')}
                        description={error}
                        type="error"
                        showIcon
                    />
                )}

                <Card className="shadow-sm border-slate-200" styles={{ body: { padding: '24px' } }}>
                    <form onSubmit={handleDecode} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-slate-700 mb-2">{t('internalVinDecoder.vehicleIdentificationNumber')}</label>
                            <Input
                                ref={inputRef}
                                size="large"
                                placeholder={t('internalVinDecoder.enter17CharacterVin')}
                                value={vin}
                                onChange={e => setVin(e.target.value.toUpperCase())}
                                maxLength={17}
                                className="h-11 border-slate-300"
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <label className="block text-sm font-medium text-slate-700 mb-2">{t('internalVinDecoder.yearOptional')}</label>
                            <Select
                                size="large"
                                className="w-full h-11"
                                placeholder={t('internalVinDecoder.year')}
                                value={modelYear || undefined}
                                onChange={val => setModelYear(val)}
                                allowClear
                            >
                                {years.map(y => <Option key={y} value={y}>{y}</Option>)}
                            </Select>
                        </div>
                        <Button 
                            type="primary" 
                            size="large" 
                            htmlType="submit" 
                            className="bg-violet-600 w-full md:w-auto hover:bg-violet-700 h-11 px-8 font-semibold shadow-sm border-none"
                            loading={loading}
                            icon={<SearchOutlined />}
                            disabled={!vin.trim()}
                        >
                            {t('internalVinDecoder.decode')}
                        </Button>
                    </form>
                </Card>

                {loading && (
                    <Card className="shadow-sm border-slate-200">
                        <Skeleton active title={false} paragraph={{ rows: 10 }} />
                    </Card>
                )}

                {!result && !loading && !error && (
                    <Empty 
                        description={<span className="text-slate-500 font-medium">{t('internalVinDecoder.searchVinToView')}</span>} 
                        className="my-16" 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}

                {result && !loading && (
                    <div className="space-y-6 mt-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" style={{ borderLeft: '4px solid #8b5cf6' }}>
                            <div className="p-6">
                                <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-2">{t('internalVinDecoder.decodedVehicle')}</p>
                                <h2 className="text-3xl font-black text-slate-900 mb-4">
                                    {[result.ModelYear, result.Make, result.Model].filter(Boolean).join(' ')}
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {[result.BodyClass, result.DriveType, result.FuelTypePrimary, result.EngineCylinders && (`${result.EngineCylinders}-cyl`), result.EngineHP && (`${result.EngineHP}hp`), result.VIN].filter(Boolean).map((tag, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium border border-slate-200">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {DATA_MAPPING.map(group => {
                                const fields = group.fields.map(k => ({ key: k, label: formatLabel(k), value: result[k] })).filter(f => f.value && f.value !== 'Not Applicable' && f.value !== '');
                                if (!fields.length) return null;
                                return (
                                    <Card key={group.title} title={<span className="font-bold text-slate-800">{group.title}</span>} className="shadow-sm border-slate-200" styles={{ head: { borderBottom: '1px solid #f1f5f9' } }}>
                                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                            {fields.map(f => (
                                                <div key={f.key}>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{f.label}</div>
                                                    <div className="text-sm font-semibold text-slate-800 break-words">{f.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InternalVinDecoderRoot;
