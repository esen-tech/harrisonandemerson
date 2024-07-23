import { useState } from 'react'


export const useAttachmentManager = (uploadFn) => {
  const [ managedAttachments, setManagedAttachments ] = useState([])

  const updateManagedAttachment = (idx, mergeObj) => {
    setManagedAttachments((attchmnts) => ([
      ...attchmnts.slice(0, idx),
      {
        ...attchmnts[idx],
        ...mergeObj,
      },
      ...attchmnts.slice(idx + 1)
    ]))
  }

  const reset = () => {
    setManagedAttachments([])
  }

  const pushFiles = async (files) => {
    let ats = []
    for (let i = 0; i < files.length; i++) {
      ats = [...ats, {
        isInProgress: false,
        isSuccess: false,
        isFailed: false,
        file: files[i],
      }]
    }
    setManagedAttachments(ats)
  }

  const removeAttachment = (idx) => {
    setManagedAttachments((attchmnts) => ([
      ...attchmnts.slice(0, idx),
      ...attchmnts.slice(idx + 1),
    ]))
  }

  const uploadAllUnstarted = async () => {
    setManagedAttachments(mas => mas.map(ma => ({
      ...ma,
      isInProgress: (ma.isSuccess || ma.isFailed) ? ma.isInProgress : true,
    })))
    managedAttachments.forEach(async (ma, i) => {
      if (ma.isSuccess || ma.isFailed) {
        return
      }
      await uploadFn(
        ma,
        (data) => {
          updateManagedAttachment(i, {
            isInProgress: false,
            isSuccess: true,
            resData: data,
          })
        },
        () => {
          updateManagedAttachment(i, {
            isInProgress: false,
            isFailed: true,
          })
        },
      )
    })
  }

  return { managedAttachments, pushFiles, uploadAllUnstarted, removeAttachment, reset }
}
