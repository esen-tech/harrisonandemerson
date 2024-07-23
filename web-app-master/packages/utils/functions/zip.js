export const zip = (a, b) => a.map((k, i) => [k, b[i]])

export const zipToObject = (keys, values) => keys.reduce((m, k, i) => ({...m, [k]: values[i]}), {})
