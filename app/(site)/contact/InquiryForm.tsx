'use client';

import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import { ChoiceGroup } from '@/components/ChoiceGroup';
import { PREV_SITE_PATH_KEY } from '@/components/Nav';
import {
  DONE_KEY, inquirySchema, newInquiryId, MANUAL_TYPES, NEEDS, TEAM_SIZES, TIMELINES, TOOLS,
  type InquiryData, type InquiryForm as Form, type InquiryRecord,
} from '@/lib/inquiry';

const FGroup = ({ n, title, children }: { n: string; title: string; children: ReactNode }) => (
  <div className="fgroup">
    <div className="fgroup-head"><span className="fgroup-num">{n}</span><h2 className="headline">{title}</h2></div>
    {children}
  </div>
);

const Err = ({ msg }: { msg?: string }) => <p className="ferr" hidden={!msg} role={msg ? 'alert' : undefined}>{msg}</p>;

export function InquiryForm({ plan }: { plan: '팀' | '엔터프라이즈' }) {
  const router = useRouter();
  const { register, control, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } =
    useForm<Form, unknown, InquiryData>({
      resolver: zodResolver(inquirySchema),
      shouldFocusError: false,
      defaultValues: {
        plan, company: '', name: '', title: '', email: '', phone: '',
        teamSize: '', manualTypes: [], currentTool: '', pain: '',
        timeline: '', needs: [], note: '', consent: false, hp: '', source: '',
      },
    });

  const fld = (name: keyof Form) => `fld${errors[name] ? ' has-error' : ''}`;

  const onInvalid = () => {
    requestAnimationFrame(() =>
      document.querySelector('.fld.has-error')?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  };

  const onValid = async (data: InquiryData) => {
    if (data.hp) return; // 봇이 채운 칸
    let source = '';
    try { source = sessionStorage.getItem(PREV_SITE_PATH_KEY) || ''; } catch { /* 저장 불가 */ }

    let result: { record: InquiryRecord; saved: boolean; mailed: boolean };
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source }),
      });
      const body = await res.json();
      if (!body?.record) throw new Error('no record');
      result = body;
    } catch {
      // 서버에 닿지 못해도 완료 화면에서 메일로 전달할 수 있게 한다 (원본과 같은 폴백)
      const rest: Omit<InquiryData, 'hp'> & { hp?: string } = { ...data };
      delete rest.hp;
      result = { record: { ...rest, source, id: newInquiryId(), createdAt: Date.now() }, saved: false, mailed: false };
    }
    try { sessionStorage.setItem(DONE_KEY, JSON.stringify(result)); } catch { /* 저장 불가 */ }
    router.push('/contact/done');
  };

  const busy = isSubmitting || isSubmitSuccessful;

  return (
    <form className="form" noValidate onSubmit={handleSubmit(onValid, onInvalid)}>
      <FGroup n="01" title="연락처">
        <div className="fgrid">
          <div className={fld('company')}>
            <label htmlFor="f-company">회사·기관명 <span className="req">*</span></label>
            <input id="f-company" type="text" autoComplete="organization" placeholder="예) 모두컴퍼니"
              aria-invalid={!!errors.company} {...register('company')} />
            <Err msg={errors.company?.message} />
          </div>
          <div className={fld('name')}>
            <label htmlFor="f-name">이름 <span className="req">*</span></label>
            <input id="f-name" type="text" autoComplete="name" aria-invalid={!!errors.name} {...register('name')} />
            <Err msg={errors.name?.message} />
          </div>
        </div>
        <div className="fgrid">
          <div className={fld('email')}>
            <label htmlFor="f-email">회신받을 이메일 <span className="req">*</span></label>
            <input id="f-email" type="email" autoComplete="email" placeholder="name@company.com"
              aria-invalid={!!errors.email} {...register('email')} />
            <Err msg={errors.email?.message} />
          </div>
          <div className="fld">
            <label htmlFor="f-phone">연락처 <span className="opt">선택</span></label>
            <input id="f-phone" type="tel" autoComplete="tel" placeholder="010-0000-0000" {...register('phone')} />
          </div>
        </div>
        <div className="fld">
          <label htmlFor="f-title">직함 <span className="opt">선택</span></label>
          <input id="f-title" type="text" placeholder="예) 콘텐츠운영팀 팀장" {...register('title')} />
        </div>
      </FGroup>

      <FGroup n="02" title="지금 상황">
        <div className={fld('teamSize')}>
          <label id="l-teamSize">예상 사용 인원 <span className="req">*</span></label>
          <Controller control={control} name="teamSize" render={({ field }) =>
            <ChoiceGroup labelledBy="l-teamSize" options={TEAM_SIZES} value={field.value} onChange={field.onChange} />} />
          <Err msg={errors.teamSize?.message} />
        </div>
        <div className={fld('manualTypes')}>
          <label id="l-manualTypes">어떤 매뉴얼을 만드시나요 <span className="req">*</span> <span className="opt">여러 개 선택 가능</span></label>
          <Controller control={control} name="manualTypes" render={({ field }) =>
            <ChoiceGroup multi labelledBy="l-manualTypes" options={MANUAL_TYPES} value={field.value} onChange={field.onChange} />} />
          <Err msg={errors.manualTypes?.message} />
        </div>
        <div className="fld">
          <label id="l-currentTool">지금은 어떻게 관리하시나요 <span className="opt">선택</span></label>
          <Controller control={control} name="currentTool" render={({ field }) =>
            <ChoiceGroup labelledBy="l-currentTool" options={TOOLS} value={field.value} onChange={field.onChange} />} />
        </div>
        <div className="fld">
          <label htmlFor="f-pain">가장 큰 어려움 <span className="opt">선택</span></label>
          <textarea id="f-pain" rows={4} placeholder="예) 담당자가 바뀔 때마다 인수인계에 2주씩 걸립니다." {...register('pain')} />
        </div>
      </FGroup>

      <FGroup n="03" title="도입 계획">
        <div className={fld('timeline')}>
          <label id="l-timeline">도입 희망 시기 <span className="req">*</span></label>
          <Controller control={control} name="timeline" render={({ field }) =>
            <ChoiceGroup labelledBy="l-timeline" options={TIMELINES} value={field.value} onChange={field.onChange} />} />
          <Err msg={errors.timeline?.message} />
        </div>
        <div className="fld">
          <label id="l-needs">필요한 기능 <span className="opt">선택 · 여러 개 가능</span></label>
          <Controller control={control} name="needs" render={({ field }) =>
            <ChoiceGroup multi labelledBy="l-needs" options={NEEDS} value={field.value} onChange={field.onChange} />} />
        </div>
        <div className="fld">
          <label htmlFor="f-note">추가로 알려주실 내용 <span className="opt">선택</span></label>
          <textarea id="f-note" rows={4} placeholder="보안 요건, 기존 시스템 연동, 예산 범위 등" {...register('note')} />
        </div>
      </FGroup>

      {/* 개인정보 수집·이용 동의 — 법적 필수. 삭제 금지 */}
      <div className={fld('consent')}>
        <div className="consent">
          <div className="consent-body">
            <b>개인정보 수집·이용 안내</b>
            <dl>
              <dt>수집 항목</dt><dd>회사·기관명, 이름, 직함, 이메일, 연락처, 문의 응답 내용</dd>
              <dt>이용 목적</dt><dd>도입 문의 회신 및 상담</dd>
              <dt>보유 기간</dt><dd>문의 처리 완료 후 1년. 파기 요청 시 즉시 파기</dd>
            </dl>
            <p className="body-sm" style={{ marginTop: 12 }}>동의를 거부하실 수 있으나, 거부하시면 문의에 회신드리기 어렵습니다.</p>
          </div>
          <label className="check" htmlFor="f-consent">
            <input id="f-consent" type="checkbox" aria-invalid={!!errors.consent} {...register('consent')} />
            <span className="check-box" aria-hidden="true">✓</span>
            <span>위 내용에 동의합니다 <span className="req">*</span></span>
          </label>
        </div>
        <Err msg={errors.consent?.message} />
      </div>

      <div className="hp" aria-hidden="true">
        <label>이 칸은 비워 두세요<input type="text" tabIndex={-1} autoComplete="off" {...register('hp')} /></label>
      </div>

      <div className="form-submit">
        <button className="btn-p" type="submit" disabled={busy}>{busy ? '보내는 중…' : '문의 보내기'}</button>
        <p className="form-note">보내기를 누르면 내용이 저장되고, 다음 화면에서 메일로 바로 전달할 수 있습니다.</p>
      </div>
    </form>
  );
}
