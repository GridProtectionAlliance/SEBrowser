//******************************************************************************************************
//  TrendCsv.ts - Gbtc
//
//  Copyright © 2026, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may not use this
//  file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//******************************************************************************************************

export type CsvValue = string | number | null | undefined;
export type CsvRow = CsvValue[];

/** Serializes rows as an Excel-compatible UTF-8 CSV document. */
export const serializeCsv = (rows: CsvRow[]): string =>
    rows
        .map(row => row.map(value => escapeCsvField(value?.toString() ?? '')).join(','))
        .join('\r\n');
        
/** Downloads CSV rows using a filename derived from the widget title. */
export const downloadCsv = (rows: CsvRow[], title?: string): void => {
    const url = URL.createObjectURL(new Blob([serializeCsv(rows)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = getCsvFileName(title);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

/** Escapes a single CSV field when it contains delimiters, quotes, or line breaks. */
const escapeCsvField = (value: string): string =>
    /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

/** Returns a Windows-safe CSV filename while preserving valid custom title characters. */
const getCsvFileName = (title?: string): string => {
    const invalidCharacters = '<>:"/\\|?*';
    const safeTitle = Array.from(title ?? '').map(character =>
        character.charCodeAt(0) < 32 || invalidCharacters.includes(character) ? '_' : character
    ).join('').trim().replace(/[. ]+$/g, '');
    const isReserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i.test(safeTitle);
    const fileName = safeTitle.length === 0 ? 'trend-data' : isReserved ? `_${safeTitle}` : safeTitle;
    return `${fileName}.csv`;
};
