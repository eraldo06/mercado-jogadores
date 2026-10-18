import { act, renderHook } from '@testing-library/react';
import type { UseMutationResult } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { useEnvioUnico } from './envio-unico';

describe('useEnvioUnico', () => {
  it('ignora segundo envio enquanto o primeiro não termina', () => {
    const mutate = vi.fn();
    const mutacao = { mutate } as unknown as UseMutationResult<
      unknown,
      Error,
      string,
      unknown
    >;
    const { result } = renderHook(() => useEnvioUnico(mutacao));

    result.current.mutate('primeiro');
    result.current.mutate('segundo');

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toBe('primeiro');
  });

  it('libera novo envio depois que o anterior termina', () => {
    const mutate = vi.fn();
    const mutacao = { mutate } as unknown as UseMutationResult<
      unknown,
      Error,
      string,
      unknown
    >;
    const { result } = renderHook(() => useEnvioUnico(mutacao));

    result.current.mutate('primeiro');
    act(() => {
      mutate.mock.calls[0][1].onSettled();
    });
    result.current.mutate('segundo');

    expect(mutate).toHaveBeenCalledTimes(2);
  });
});
