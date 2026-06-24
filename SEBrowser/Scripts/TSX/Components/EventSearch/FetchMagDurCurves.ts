import { OpenXDA } from '@gpa-gemstone/application-typings';

export const FetchMagDurCurves = (): JQuery.jqXHR<OpenXDA.Types.MagDurCurve[]> => $.ajax({
    type: 'GET',
    url: `${homePath}api/openXDA/StandardMagDurCurve/Name/1`,
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    cache: true,
    async: true
});
