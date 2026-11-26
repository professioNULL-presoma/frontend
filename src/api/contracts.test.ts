import {
  ContractError,
  MAX_TOTAL_BYTES,
  listContracts,
  setMockContracts,
  uploadContract,
} from './contracts'

const file = (type: string, size = 10) => new File([new Uint8Array(size)], 'page', { type })

describe('uploadContract (mock)', () => {
  it('returns a PROCESSING contract', async () => {
    await expect(
      uploadContract([file('image/jpeg'), file('application/pdf')], 't'),
    ).resolves.toMatchObject({
      status: 'PROCESSING',
    })
  })

  it('rejects unsupported file types', async () => {
    await expect(uploadContract([file('text/plain')], 't')).rejects.toMatchObject({
      code: 'INVALID_FILE_TYPE',
    })
  })

  it('rejects files over the size limit', async () => {
    const p = uploadContract([file('application/pdf', MAX_TOTAL_BYTES + 1)], 't')
    await expect(p).rejects.toBeInstanceOf(ContractError)
    await expect(p).rejects.toMatchObject({ code: 'FILE_TOO_LARGE' })
  })
})

describe('listContracts (mock)', () => {
  it('lists a newly uploaded contract first, still being reviewed', async () => {
    setMockContracts([])
    const { contractId } = await uploadContract([file('image/png')], 't')
    const list = await listContracts('t')
    expect(list[0]).toMatchObject({ id: contractId, processingStatus: 'REVIEWING', title: null })
  })
})
