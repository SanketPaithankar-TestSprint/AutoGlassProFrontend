import React, { useMemo, useState, lazy, Suspense } from "react";
import { Select, Modal, Button } from "antd";
import { DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import CurrencyInput from "../common/CurrencyInput";
import { ADAS_TYPES } from "../../const/adasTypes";
import { useTranslation } from "react-i18next";

// Lazy load heavy modal
const KitSelectionModal = lazy(() => import("./KitSelectionModal"));

const SERVICE_OPTIONS = [
    { label: "Window Regulator", value: "WINDOW_REGULATOR" },
    { label: "Window Regulator w/ Motor", value: "WINDOW_REGULATOR_WITH_MOTOR" },
    { label: "Window Switch", value: "WINDOW_SWITCH" },
    { label: "Other", value: "OTHER" }
];

const LABOR_OPTIONS = [
    { label: "chip repair", value: "CHIP_REPAIR" },
    { label: "windshield leaking", value: "WINDSHIELD_LEAKING" },
    { label: "rear view mirror repair", value: "REAR_VIEW_MIRROR_REPAIR" },
    { label: "reinstallation of windshield", value: "REINSTALLATION_OF_WINDSHIELD" },
    { label: "other", value: "OTHER" }
];

/**
 * QuoteItemsTable renders the line-items table (desktop) and card list (mobile).
 * Also renders modals for glass selection and kit selection.
 */
export default function QuoteItemsTable({
    items,
    updateItem,
    handleDeleteItem,
    handlePartNoBlur,
    handleAdasChange,
    handleServiceChange,
    handleLaborChange,
    // Glass selection modal
    glassSelectionModal,
    handleGlassSelection,
    handleCloseGlassSelection,
    // Kit selection modal
    kitSelectionModal,
    handleKitSelection,
    handleCloseKitSelection,
}) {
    const { t } = useTranslation();
    // Mobile: Expanded description state
    const [expandedDescriptions, setExpandedDescriptions] = useState({});

    return (
        <div className="bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] rounded-lg mb-3 sm:mb-4">
            {/* Glass Selection Modal */}
            <Modal
                title={<span className="text-[#7E5CFE] ">{t('quoteDetails.selectGlassType')}</span>}
                open={glassSelectionModal.visible}
                onCancel={handleCloseGlassSelection}
                footer={null}
                width={850}
                centered
            >
                <div className="py-2">
                    <p className="text-sm text-slate-600 mb-3">
                        {t('quoteDetails.multipleGlassTypesFound')} <strong>{glassSelectionModal.partNo}</strong>. {t('quoteDetails.pleaseSelectOne')}
                    </p>
                    <div className="overflow-x-auto max-h-[350px] overflow-y-auto border border-slate-200 rounded-lg">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('quoteDetails.part')}</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('quoteDetails.description')}</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('quoteDetails.oem')}</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t('quoteDetails.price')}</th>
                                    <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">{t('quoteDetails.kits')}</th>
                                    <th className="px-2 py-2 w-8"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {glassSelectionModal.options.map((glass, index) => (
                                    <tr
                                        key={`${glass.nags_id}_${glass.feature_span}_${index}`}
                                        onClick={() => handleGlassSelection(glass)}
                                        className="hover:bg-violet-50 cursor-pointer transition-colors group"
                                    >
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <span className="font-mono font-semibold text-slate-800">
                                                {glass.nags_id} {glass.feature_span}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="text-sm text-slate-600">
                                                {Array.isArray(glass.qualifiers) && glass.qualifiers.length > 0
                                                    ? glass.qualifiers.join(', ')
                                                    : '-'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <span className="text-sm text-blue-600">
                                                {Array.isArray(glass.OEMS) && glass.OEMS.length > 0
                                                    ? glass.OEMS[0]
                                                    : '-'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-right whitespace-nowrap">
                                            <span className="font-semibold text-green-600">
                                                ${glass.list_price?.toFixed(2) || '0.00'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-center whitespace-nowrap">
                                            {Array.isArray(glass.kit) && glass.kit.length > 0 ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-700">
                                                    {glass.kit.length}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-2 py-2 text-slate-400 group-hover:text-[#7E5CFE] transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>

            {/* Kit Selection Modal */}
            {kitSelectionModal.visible && (
                <Suspense fallback={null}>
                    <KitSelectionModal
                        visible={kitSelectionModal.visible}
                        onClose={handleCloseKitSelection}
                        onSelect={handleKitSelection}
                        kits={kitSelectionModal.kits}
                        partNumber={kitSelectionModal.selectedGlass?.nags_id || ''}
                    />
                </Suspense>
            )}

            {/* Desktop Table View (md and up) */}
            <div className="border border-slate-100 bg-white rounded-lg max-h-[350px] sm:max-h-[400px] overflow-x-auto overflow-y-auto hidden md:block" data-quote-details-table>
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50 sticky top-0 z-10">
                        <tr className="text-left text-sm sm:text-base font-bold text-slate-700 tracking-tight">
                            <th className="px-1 sm:px-2 py-2 w-[100px] sm:w-[160px] bg-slate-50">{t('quoteDetails.part')}</th>
                            <th className="px-1 sm:px-2 py-2 bg-slate-50">{t('quoteDetails.description')}</th>
                            <th className="px-1 sm:px-2 py-2 w-[80px] sm:w-[110px] bg-slate-50 hidden md:table-cell">{t('quoteDetails.manufacturer')}</th>
                            <th className="px-1 sm:px-2 py-2 text-right w-[60px] sm:w-[70px] bg-slate-50">{t('quoteDetails.qty')}</th>
                            <th className="px-1 sm:px-2 py-2 text-right w-[80px] sm:w-[100px] bg-slate-50">{t('quoteDetails.list')}</th>
                            <th className="px-1 sm:px-2 py-2 text-right w-[80px] sm:w-[100px] bg-slate-50">{t('quoteDetails.amount')}</th>
                            <th className="px-1 sm:px-2 py-2 w-5 bg-slate-50"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {items.map((it) => {
                            let rowSpan = 1;
                            let showDeleteButton = true;

                            if (it.type === 'Part') {
                                const partId = it.id;
                                const hasLabor = items.some(item => item.id === `${partId}_LABOR`);
                                const kitCount = items.filter(item => item.parentPartId === partId && item.type === 'Kit').length;
                                rowSpan = 1 + (hasLabor ? 1 : 0) + kitCount;
                            } else if (it.type === 'Labor' && it.id.endsWith('_LABOR')) {
                                showDeleteButton = false;
                            } else if (it.type === 'Kit' && it.parentPartId) {
                                showDeleteButton = false;
                            }

                            const serviceOptionsWithCustom = [...SERVICE_OPTIONS];
                            if (it.type === 'Service' && it.description && !SERVICE_OPTIONS.some(opt => opt.label === it.description)) {
                                serviceOptionsWithCustom.push({ label: it.description, value: "__custom__" });
                            }
                            const serviceSelectValue = it.type === 'Service'
                                ? (it.serviceType
                                    || SERVICE_OPTIONS.find(opt => opt.label === it.description)?.value
                                    || (serviceOptionsWithCustom.some(opt => opt.value === "__custom__") ? "__custom__" : null))
                                : null;

                            const laborOptionsWithCustom = [...LABOR_OPTIONS];
                            if (it.type === 'Labor' && it.description && !LABOR_OPTIONS.some(opt => opt.label === it.description)) {
                                laborOptionsWithCustom.push({ label: it.description, value: "__custom__" });
                            }
                            const laborSelectValue = it.type === 'Labor'
                                ? (it.laborType
                                    || LABOR_OPTIONS.find(opt => opt.label === it.description)?.value
                                    || (laborOptionsWithCustom.some(opt => opt.value === "__custom__") ? "__custom__" : null))
                                : null;

                            return (
                                <tr key={it.id} className="hover:bg-slate-50 transition group">
                                    <td className="px-1 sm:px-2 py-1 align-middle">
                                        <div className="relative">
                                            {it.type === 'Part' ? (
                                                <input
                                                    value={it.nagsId}
                                                    onChange={(e) => updateItem(it.id, "nagsId", e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handlePartNoBlur(it.id, e.currentTarget.value);
                                                            e.currentTarget.blur();
                                                        }
                                                    }}
                                                    className="w-full h-7 px-1 sm:px-2 rounded border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-transparent text-slate-700 transition-all font-medium text-sm"
                                                    placeholder={t('quoteDetails.partNo')}
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={it.type === 'Labor' ? 'LABOR' : it.type === 'ADAS' ? 'ADAS' : it.type === 'Kit' ? (it.nagsId || 'KIT') : 'SERVICE'}
                                                    readOnly
                                                    className="w-full h-7 px-1 sm:px-2 rounded border-none outline-none bg-transparent text-slate-500 font-medium cursor-default text-sm"
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-1 sm:px-2 py-1 align-middle">
                                        {it.type === 'ADAS' ? (
                                            <Select
                                                className="w-full text-sm custom-select-borderless"
                                                size="small"
                                                bordered={false}
                                                placeholder={t('quoteDetails.selectType')}
                                                value={it.adasCode || null}
                                                onChange={(val) => handleAdasChange(it.id, val)}
                                                options={ADAS_TYPES.map(type => ({
                                                    label: type.code,
                                                    value: type.code
                                                }))}
                                                dropdownMatchSelectWidth={false}
                                            />
                                        ) : it.type === 'Service' ? (
                                            serviceSelectValue === "OTHER" ? (
                                                <input
                                                    type="text"
                                                    value={it.description || ''}
                                                    onChange={(e) => updateItem(it.id, "description", e.target.value)}
                                                    placeholder={t('quoteDetails.enterServiceDetails')}
                                                    className="w-full h-7 px-1 sm:px-2 rounded border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-transparent text-slate-700 transition-all text-sm"
                                                />
                                            ) : (
                                                <Select
                                                    className="w-full text-sm custom-select-borderless"
                                                    size="small"
                                                    bordered={false}
                                                    placeholder={t('quoteDetails.selectService', 'Select Service')}
                                                    value={serviceSelectValue}
                                                    onChange={(val) => handleServiceChange(it.id, val)}
                                                    options={serviceOptionsWithCustom.map(opt => ({
                                                        ...opt,
                                                        label: opt.value === '__custom__' ? opt.label : t(`quoteDetails.services.${opt.value}`, opt.label)
                                                    }))}
                                                    dropdownMatchSelectWidth={false}
                                                    optionFilterProp="label"
                                                    showSearch
                                                />
                                            )
                                        ) : it.type === 'Labor' ? (
                                            laborSelectValue === "OTHER" ? (
                                                <input
                                                    type="text"
                                                    value={it.description || ''}
                                                    onChange={(e) => updateItem(it.id, "description", e.target.value)}
                                                    placeholder={t('quoteDetails.enterLaborDetails')}
                                                    className="w-full h-7 px-1 sm:px-2 rounded border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-transparent text-slate-700 transition-all text-sm"
                                                />
                                            ) : (
                                                <Select
                                                    className="w-full text-sm custom-select-borderless"
                                                    size="small"
                                                    bordered={false}
                                                    placeholder={t('quoteDetails.selectLabor', 'Select Labor')}
                                                    value={laborSelectValue}
                                                    onChange={(val) => handleLaborChange(it.id, val)}
                                                    options={laborOptionsWithCustom.map(opt => ({
                                                        ...opt,
                                                        label: opt.value === '__custom__' ? opt.label : t(`quoteDetails.labors.${opt.value}`, opt.label)
                                                    }))}
                                                    dropdownMatchSelectWidth={false}
                                                    optionFilterProp="label"
                                                    showSearch
                                                />
                                            )
                                        ) : (
                                            <input
                                                value={it.description || ''}
                                                onChange={(e) => updateItem(it.id, "description", e.target.value)}
                                                className="w-full h-7 px-1 sm:px-2 rounded border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-transparent text-slate-700 transition-all text-sm"
                                            />
                                        )}
                                    </td>
                                    <td className="px-1 sm:px-2 py-1 align-middle hidden md:table-cell">
                                        <input
                                            value={it.manufacturer}
                                            onChange={(e) => updateItem(it.id, "manufacturer", e.target.value)}
                                            className="w-full h-7 px-1 sm:px-2 rounded border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-transparent text-slate-700 transition-all text-sm"
                                            disabled={!it.isManual && it.type === 'Labor'}
                                        />
                                    </td>
                                    <td className="px-1 sm:px-2 py-1 text-right align-middle">
                                        <input
                                            type="number"
                                            value={it.qty}
                                            onChange={(e) => updateItem(it.id, "qty", e.target.value)}
                                            className="w-full h-7 px-1 sm:px-2 rounded border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-right outline-none bg-transparent text-slate-700 transition-all font-medium text-sm"
                                            disabled={!it.isManual && it.type === 'Labor'}
                                        />
                                    </td>
                                    <td className="px-1 sm:px-2 py-1 text-right align-middle">
                                        <CurrencyInput
                                            value={it.listPrice}
                                            onChange={(val) => updateItem(it.id, "listPrice", val)}
                                            className="w-full h-7 px-1 sm:px-2 rounded border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-right outline-none bg-transparent text-slate-700 transition-all text-sm"
                                            disabled={!it.isManual && it.type === 'Labor'}
                                            placeholder="$0.00"
                                        />
                                    </td>
                                    <td className="px-1 sm:px-2 py-1 text-right align-middle">
                                        {it.isLoadingVendorPrice ? (
                                            <div className="flex items-center justify-end gap-2 h-7">
                                                <LoadingOutlined className="text-violet-600" style={{ fontSize: '14px' }} />
                                                <span className="text-xs text-slate-500">{t('quoteDetails.fetching')}</span>
                                            </div>
                                        ) : (
                                            <CurrencyInput
                                                value={it.amount}
                                                onChange={(val) => updateItem(it.id, "amount", val)}
                                                className="w-full h-7 px-1 sm:px-2 rounded border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-right outline-none bg-transparent text-slate-900 font-bold transition-all text-sm"
                                                placeholder="$0.00"
                                            />
                                        )}
                                    </td>
                                    {showDeleteButton && (
                                        <td className="px-1 py-0.5 text-center align-middle" rowSpan={rowSpan}>
                                            <button type="button" onClick={() => handleDeleteItem(it.id)} className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50" title={t('quoteDetails.removeItem')}>
                                                <DeleteOutlined style={{ fontSize: '14px' }} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                        {/* Empty placeholder rows */}
                        {Array.from({ length: Math.max(0, 6 - items.length) }).map((_, index) => (
                            <tr key={`empty-${index}`} className="h-10">
                                <td className="px-1 sm:px-2 py-1">&nbsp;</td>
                                <td className="px-1 sm:px-2 py-1"></td>
                                <td className="px-1 sm:px-2 py-1 hidden md:table-cell"></td>
                                <td className="px-1 sm:px-2 py-1"></td>
                                <td className="px-1 sm:px-2 py-1"></td>
                                <td className="px-1 sm:px-2 py-1"></td>
                                <td className="px-1 sm:px-2 py-1"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View (below md) */}
            <div className="md:hidden space-y-2 p-2 mt-4">
                {items.length > 0 ? (
                    items.map((it) => {
                        const getBorderColor = (type) => {
                            switch (type) {
                                case 'Part': return 'border-l-4 border-l-blue-500';
                                case 'Labor': return 'border-l-4 border-l-green-500';
                                case 'Kit': return 'border-l-4 border-l-yellow-500';
                                case 'ADAS': return 'border-l-4 border-l-purple-500';
                                case 'Service': return 'border-l-4 border-l-orange-500';
                                default: return 'border-l-4 border-l-slate-300';
                            }
                        };

                        const serviceOptionsWithCustom = [...SERVICE_OPTIONS];
                        if (it.type === 'Service' && it.description && !SERVICE_OPTIONS.some(opt => opt.label === it.description)) {
                            serviceOptionsWithCustom.push({ label: it.description, value: "__custom__" });
                        }
                        const serviceSelectValue = it.type === 'Service'
                            ? (it.serviceType
                                || SERVICE_OPTIONS.find(opt => opt.label === it.description)?.value
                                || (serviceOptionsWithCustom.some(opt => opt.value === "__custom__") ? "__custom__" : null))
                            : null;

                        const laborOptionsWithCustom = [...LABOR_OPTIONS];
                        if (it.type === 'Labor' && it.description && !LABOR_OPTIONS.some(opt => opt.label === it.description)) {
                            laborOptionsWithCustom.push({ label: it.description, value: "__custom__" });
                        }
                        const laborSelectValue = it.type === 'Labor'
                            ? (it.laborType
                                || LABOR_OPTIONS.find(opt => opt.label === it.description)?.value
                                || (laborOptionsWithCustom.some(opt => opt.value === "__custom__") ? "__custom__" : null))
                            : null;

                        return (
                            <div
                                key={it.id}
                                className={`bg-white border border-slate-200 ${getBorderColor(it.type)} rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden`}
                            >
                                <div className="px-3 py-3">
                                    {/* ROW 1: Part Number + Delete */}
                                    <div className="flex items-start gap-2 mb-3">
                                        <div className="flex-1">
                                            {it.type === 'Part' ? (
                                                <input
                                                    value={it.nagsId}
                                                    onChange={(e) => updateItem(it.id, "nagsId", e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handlePartNoBlur(it.id, e.currentTarget.value);
                                                            e.currentTarget.blur();
                                                        }
                                                    }}
                                                    className="w-full h-7 px-2 rounded border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-transparent text-slate-900 font-mono font-bold text-sm break-words"
                                                    placeholder={t('quoteDetails.partNo')}
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={it.type === 'Labor' ? 'LABOR' : it.type === 'ADAS' ? 'ADAS' : it.type === 'Kit' ? (it.nagsId || 'KIT') : 'SERVICE'}
                                                    readOnly
                                                    className="w-full h-7 px-2 rounded border-none outline-none bg-transparent text-slate-500 font-bold cursor-default text-xs"
                                                />
                                            )}
                                        </div>
                                        {!it.id.endsWith('_LABOR') && !it.parentPartId && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteItem(it.id)}
                                                className="h-7 w-7 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-all rounded-md flex-shrink-0"
                                                title={t('quoteDetails.removeItem')}
                                            >
                                                <DeleteOutlined style={{ fontSize: '14px' }} />
                                            </button>
                                        )}
                                    </div>

                                    {/* ROW 2: Manufacturer + Qty + List Price + Amount */}
                                    <div className="grid grid-cols-4 gap-2 mb-3 pb-3 border-b border-slate-100">
                                        <div>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-1">{t('quoteDetails.mfg')}</p>
                                            <input
                                                value={it.manufacturer}
                                                onChange={(e) => updateItem(it.id, "manufacturer", e.target.value)}
                                                className="w-full h-6 px-1.5 rounded border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-transparent text-slate-700 text-xs"
                                                disabled={!it.isManual && it.type === 'Labor'}
                                                placeholder=""
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-1 text-center">{t('quoteDetails.qty')}</p>
                                            <input
                                                type="number"
                                                value={it.qty}
                                                onChange={(e) => updateItem(it.id, "qty", e.target.value)}
                                                className="w-full h-6 px-1 rounded border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-center outline-none bg-transparent text-slate-700 font-semibold text-xs"
                                                disabled={!it.isManual && it.type === 'Labor'}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-1 text-right">{t('quoteDetails.list')}</p>
                                            <CurrencyInput
                                                value={it.listPrice}
                                                onChange={(val) => updateItem(it.id, "listPrice", val)}
                                                className="w-full h-6 px-1 rounded border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-right outline-none bg-transparent text-slate-700 text-xs"
                                                disabled={!it.isManual && it.type === 'Labor'}
                                                placeholder="$0"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-1 text-right">{t('quoteDetails.amt')}</p>
                                            {it.isLoadingVendorPrice ? (
                                                <div className="flex items-center justify-end h-6">
                                                    <LoadingOutlined style={{ fontSize: '12px' }} className="text-violet-600" />
                                                </div>
                                            ) : (
                                                <CurrencyInput
                                                    value={it.amount}
                                                    onChange={(val) => updateItem(it.id, "amount", val)}
                                                    className="w-full h-6 px-1 rounded border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-right outline-none bg-transparent text-violet-700 font-bold text-xs"
                                                    placeholder="$0"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* ROW 3: Description */}
                                    <div className={it.type === 'Part' ? '' : 'min-h-16'}>
                                        {it.type === 'ADAS' ? (
                                            <Select
                                                className="w-full text-xs custom-select-borderless"
                                                size="small"
                                                bordered={false}
                                                placeholder={t('quoteDetails.selectType')}
                                                value={it.adasCode || null}
                                                onChange={(val) => handleAdasChange(it.id, val)}
                                                options={ADAS_TYPES.map(type => ({
                                                    label: type.code,
                                                    value: type.code
                                                }))}
                                                dropdownMatchSelectWidth={false}
                                                style={{ minHeight: '64px' }}
                                            />
                                        ) : it.type === 'Service' ? (
                                            serviceSelectValue === "OTHER" ? (
                                                <input
                                                    type="text"
                                                    value={it.description || ''}
                                                    onChange={(e) => updateItem(it.id, "description", e.target.value)}
                                                    placeholder={t('quoteDetails.enterServiceDetails')}
                                                    className="w-full min-h-16 px-2 py-1.5 rounded border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white text-slate-700 text-xs break-words whitespace-pre-wrap resize-none"
                                                />
                                            ) : (
                                                <Select
                                                    className="w-full text-xs custom-select-borderless"
                                                    size="small"
                                                    bordered={false}
                                                    placeholder={t('quoteDetails.selectService')}
                                                    value={serviceSelectValue}
                                                    onChange={(val) => handleServiceChange(it.id, val)}
                                                    options={serviceOptionsWithCustom.map(opt => ({
                                                        ...opt,
                                                        label: opt.value === '__custom__' ? opt.label : t(`quoteDetails.services.${opt.value}`, opt.label)
                                                    }))}
                                                    dropdownMatchSelectWidth={false}
                                                    optionFilterProp="label"
                                                    showSearch
                                                    style={{ minHeight: '64px' }}
                                                />
                                            )
                                        ) : it.type === 'Labor' ? (
                                            laborSelectValue === "OTHER" ? (
                                                <input
                                                    type="text"
                                                    value={it.description || ''}
                                                    onChange={(e) => updateItem(it.id, "description", e.target.value)}
                                                    placeholder={t('quoteDetails.enterLaborDetails')}
                                                    className="w-full min-h-16 px-2 py-1.5 rounded border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white text-slate-700 text-xs break-words whitespace-pre-wrap resize-none"
                                                />
                                            ) : (
                                                <Select
                                                    className="w-full text-xs custom-select-borderless"
                                                    size="small"
                                                    bordered={false}
                                                    placeholder={t('quoteDetails.selectLabor')}
                                                    value={laborSelectValue}
                                                    onChange={(val) => handleLaborChange(it.id, val)}
                                                    options={laborOptionsWithCustom.map(opt => ({
                                                        ...opt,
                                                        label: opt.value === '__custom__' ? opt.label : t(`quoteDetails.labors.${opt.value}`, opt.label)
                                                    }))}
                                                    dropdownMatchSelectWidth={false}
                                                    optionFilterProp="label"
                                                    showSearch
                                                    style={{ minHeight: '64px' }}
                                                />
                                            )
                                        ) : (
                                            <textarea
                                                value={it.description || ''}
                                                onChange={(e) => updateItem(it.id, "description", e.target.value)}
                                                placeholder="Part description"
                                                className="w-full h-auto px-2 py-1.5 rounded border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white text-slate-700 text-xs break-words whitespace-pre-wrap resize-none overflow-hidden"
                                                style={{ minHeight: '60px', maxHeight: 'none' }}
                                                onInput={(e) => {
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = e.target.scrollHeight + 'px';
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        <p className="text-sm">{t('quoteDetails.noItemsAddedYet')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
