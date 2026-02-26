.model small
.stack 100h

.data

MAX_TARIFF   EQU 4000
CAT_COUNT    EQU 8
EXP_COUNT    EQU 10
IMP_COUNT    EQU 10
IMP_STRIDE   EQU EXP_COUNT*CAT_COUNT   ; = 80 words per importer block

; -----------------------------------------------------------------------
; TARIFF_TABLE: 3-D  [IMP_COUNT][EXP_COUNT][CAT_COUNT]  words
; Total = 10 * 10 * 8 = 800 words = 1600 bytes
;
; Index formula (all 1-based):
;   word_offset = (imp-1)*80 + (exp-1)*8 + (cat-1)
;   byte_offset = word_offset * 2
;
; Values represent tariff * 100  (e.g. 2500 = 25.00%)
; -----------------------------------------------------------------------
TARIFF_TABLE label word

; --- IMP = 1 ---
dw 2500,2400,2300,2200,2100,2000,1900,1800  ; exp=1
dw 2600,2500,2400,2300,2200,2100,2000,1900  ; exp=2
dw 2700,2600,2500,2400,2300,2200,2100,2000  ; exp=3
dw 2800,2700,2600,2500,2400,2300,2200,2100  ; exp=4
dw 2900,2800,2700,2600,2500,2400,2300,2200  ; exp=5
dw 3000,2900,2800,2700,2600,2500,2400,2300  ; exp=6
dw 3100,3000,2900,2800,2700,2600,2500,2400  ; exp=7
dw 3200,3100,3000,2900,2800,2700,2600,2500  ; exp=8
dw 3300,3200,3100,3000,2900,2800,2700,2600  ; exp=9
dw 3400,3300,3200,3100,3000,2900,2800,2700  ; exp=10

; --- IMP = 2 ---
dw 2600,2500,2400,2300,2200,2100,2000,1900  ; exp=1
dw 2700,2600,2500,2400,2300,2200,2100,2000  ; exp=2
dw 2800,2700,2600,2500,2400,2300,2200,2100  ; exp=3
dw 2900,2800,2700,2600,2500,2400,2300,2200  ; exp=4
dw 3000,2900,2800,2700,2600,2500,2400,2300  ; exp=5
dw 3100,3000,2900,2800,2700,2600,2500,2400  ; exp=6
dw 3200,3100,3000,2900,2800,2700,2600,2500  ; exp=7
dw 3300,3200,3100,3000,2900,2800,2700,2600  ; exp=8
dw 3400,3300,3200,3100,3000,2900,2800,2700  ; exp=9
dw 3500,3400,3300,3200,3100,3000,2900,2800  ; exp=10

; --- IMP = 3 ---
dw 2700,2600,2500,2400,2300,2200,2100,2000  ; exp=1
dw 2800,2700,2600,2500,2400,2300,2200,2100  ; exp=2
dw 2900,2800,2700,2600,2500,2400,2300,2200  ; exp=3
dw 3000,2900,2800,2700,2600,2500,2400,2300  ; exp=4
dw 3100,3000,2900,2800,2700,2600,2500,2400  ; exp=5
dw 3200,3100,3000,2900,2800,2700,2600,2500  ; exp=6
dw 3300,3200,3100,3000,2900,2800,2700,2600  ; exp=7
dw 3400,3300,3200,3100,3000,2900,2800,2700  ; exp=8
dw 3500,3400,3300,3200,3100,3000,2900,2800  ; exp=9
dw 3600,3500,3400,3300,3200,3100,3000,2900  ; exp=10

; --- IMP = 4 ---
dw 2800,2700,2600,2500,2400,2300,2200,2100  ; exp=1
dw 2900,2800,2700,2600,2500,2400,2300,2200  ; exp=2
dw 3000,2900,2800,2700,2600,2500,2400,2300  ; exp=3
dw 3100,3000,2900,2800,2700,2600,2500,2400  ; exp=4
dw 3200,3100,3000,2900,2800,2700,2600,2500  ; exp=5
dw 3300,3200,3100,3000,2900,2800,2700,2600  ; exp=6
dw 3400,3300,3200,3100,3000,2900,2800,2700  ; exp=7
dw 3500,3400,3300,3200,3100,3000,2900,2800  ; exp=8
dw 3600,3500,3400,3300,3200,3100,3000,2900  ; exp=9
dw 3700,3600,3500,3400,3300,3200,3100,3000  ; exp=10

; --- IMP = 5 ---
dw 2900,2800,2700,2600,2500,2400,2300,2200  ; exp=1
dw 3000,2900,2800,2700,2600,2500,2400,2300  ; exp=2
dw 3100,3000,2900,2800,2700,2600,2500,2400  ; exp=3
dw 3200,3100,3000,2900,2800,2700,2600,2500  ; exp=4
dw 3300,3200,3100,3000,2900,2800,2700,2600  ; exp=5
dw 3400,3300,3200,3100,3000,2900,2800,2700  ; exp=6
dw 3500,3400,3300,3200,3100,3000,2900,2800  ; exp=7
dw 3600,3500,3400,3300,3200,3100,3000,2900  ; exp=8
dw 3700,3600,3500,3400,3300,3200,3100,3000  ; exp=9
dw 3800,3700,3600,3500,3400,3300,3200,3100  ; exp=10

; --- IMP = 6 ---
dw 3000,2900,2800,2700,2600,2500,2400,2300  ; exp=1
dw 3100,3000,2900,2800,2700,2600,2500,2400  ; exp=2
dw 3200,3100,3000,2900,2800,2700,2600,2500  ; exp=3
dw 3300,3200,3100,3000,2900,2800,2700,2600  ; exp=4
dw 3400,3300,3200,3100,3000,2900,2800,2700  ; exp=5
dw 3500,3400,3300,3200,3100,3000,2900,2800  ; exp=6
dw 3600,3500,3400,3300,3200,3100,3000,2900  ; exp=7
dw 3700,3600,3500,3400,3300,3200,3100,3000  ; exp=8
dw 3800,3700,3600,3500,3400,3300,3200,3100  ; exp=9
dw 3900,3800,3700,3600,3500,3400,3300,3200  ; exp=10

; --- IMP = 7 ---
dw 3100,3000,2900,2800,2700,2600,2500,2400  ; exp=1
dw 3200,3100,3000,2900,2800,2700,2600,2500  ; exp=2
dw 3300,3200,3100,3000,2900,2800,2700,2600  ; exp=3
dw 3400,3300,3200,3100,3000,2900,2800,2700  ; exp=4
dw 3500,3400,3300,3200,3100,3000,2900,2800  ; exp=5
dw 3600,3500,3400,3300,3200,3100,3000,2900  ; exp=6
dw 3700,3600,3500,3400,3300,3200,3100,3000  ; exp=7
dw 3800,3700,3600,3500,3400,3300,3200,3100  ; exp=8
dw 3900,3800,3700,3600,3500,3400,3300,3200  ; exp=9
dw 4000,3900,3800,3700,3600,3500,3400,3300  ; exp=10

; --- IMP = 8 ---
dw 3200,3100,3000,2900,2800,2700,2600,2500  ; exp=1
dw 3300,3200,3100,3000,2900,2800,2700,2600  ; exp=2
dw 3400,3300,3200,3100,3000,2900,2800,2700  ; exp=3
dw 3500,3400,3300,3200,3100,3000,2900,2800  ; exp=4
dw 3600,3500,3400,3300,3200,3100,3000,2900  ; exp=5
dw 3700,3600,3500,3400,3300,3200,3100,3000  ; exp=6
dw 3800,3700,3600,3500,3400,3300,3200,3100  ; exp=7
dw 3900,3800,3700,3600,3500,3400,3300,3200  ; exp=8
dw 4000,3900,3800,3700,3600,3500,3400,3300  ; exp=9
dw 4000,4000,3900,3800,3700,3600,3500,3400  ; exp=10

; --- IMP = 9 ---
dw 3300,3200,3100,3000,2900,2800,2700,2600  ; exp=1
dw 3400,3300,3200,3100,3000,2900,2800,2700  ; exp=2
dw 3500,3400,3300,3200,3100,3000,2900,2800  ; exp=3
dw 3600,3500,3400,3300,3200,3100,3000,2900  ; exp=4
dw 3700,3600,3500,3400,3300,3200,3100,3000  ; exp=5
dw 3800,3700,3600,3500,3400,3300,3200,3100  ; exp=6
dw 3900,3800,3700,3600,3500,3400,3300,3200  ; exp=7
dw 4000,3900,3800,3700,3600,3500,3400,3300  ; exp=8
dw 4000,4000,3900,3800,3700,3600,3500,3400  ; exp=9
dw 4000,4000,4000,3900,3800,3700,3600,3500  ; exp=10

; --- IMP = 10 ---
dw 3400,3300,3200,3100,3000,2900,2800,2700  ; exp=1
dw 3500,3400,3300,3200,3100,3000,2900,2800  ; exp=2
dw 3600,3500,3400,3300,3200,3100,3000,2900  ; exp=3
dw 3700,3600,3500,3400,3300,3200,3100,3000  ; exp=4
dw 3800,3700,3600,3500,3400,3300,3200,3100  ; exp=5
dw 3900,3800,3700,3600,3500,3400,3300,3200  ; exp=6
dw 4000,3900,3800,3700,3600,3500,3400,3300  ; exp=7
dw 4000,4000,3900,3800,3700,3600,3500,3400  ; exp=8
dw 4000,4000,4000,3900,3800,3700,3600,3500  ; exp=9
dw 4000,4000,4000,4000,3900,3800,3700,3600  ; exp=10

; -----------------------------------------------------------------------
; Variables
; -----------------------------------------------------------------------
user_exp    db 0
user_imp    db 0
user_cat    db 0
user_cond   db 0
user_dcl_lo dw 0
user_dcl_hi dw 0

base_tariff dw 0
eff_tariff  dw 0
duty_lo     dw 0
duty_hi     dw 0

crlf      db 13,10,'$'
msg_title db 'INTERNATIONAL TRADE TARIFF SYSTEM',13,10,'$'
msg_exp   db 13,10,'Exporter (1-10): $'
msg_imp   db 13,10,'Importer (1-10): $'
msg_cat   db 13,10,'Category (1-8): $'
msg_dcl   db 13,10,'Declared Value: $'
msg_cond  db 13,10,'Condition (1=Normal 2=Pref 3=Penalty): $'
msg_bad   db 13,10,'INVALID INPUT',13,10,'$'
msg_same  db 13,10,'EXPORTER = IMPORTER NOT ALLOWED',13,10,'$'
msg_base  db 13,10,'Base Tariff: $'
msg_eff   db 13,10,'Effective Tariff: $'
msg_duty  db 13,10,'Duty Payable: $'

.code

; -----------------------------------------------------------------------
; MAIN
; -----------------------------------------------------------------------
start:
    mov ax, @data
    mov ds, ax
    ; NOTE: ES still points to the PSP segment here (DOS guarantee for EXEs).
    ;       ParseCmdLine reads the command tail via ES:[80h..].

    call ParseCmdLine       ; try to parse 5 args from command line
    jnc  do_lookup          ; CF=0  all 5 valid → skip interactive input

    ; ---- Interactive path: print title and collect input ----------------
    mov ah, 09h
    lea dx, msg_title
    int 21h

; -----------------------------------------------------------------------
; INPUT LOOP
; -----------------------------------------------------------------------
input_loop:
    ; --- Exporter ---
    lea dx, msg_exp
    call ReadRange10
    mov [user_exp], al

    ; --- Importer ---
    lea dx, msg_imp
    call ReadRange10
    mov [user_imp], al

    ; --- Same-party check ---
    mov al, [user_exp]
    cmp al, [user_imp]
    jne skip_same
    jmp same_err
skip_same:

    ; --- Category ---
    lea dx, msg_cat
    call ReadRange8
    mov [user_cat], al

    ; --- Declared Value (32-bit) ---
    lea dx, msg_dcl
    call Read32             ; returns DX:AX
    mov [user_dcl_lo], ax
    mov [user_dcl_hi], dx

    ; --- Condition ---
    lea dx, msg_cond
    call ReadRange3
    mov [user_cond], al

do_lookup:
    ; --- Look up base tariff ---
    call FindTariff
    mov [base_tariff], ax

    ; --- Apply trade policy ---
    call ApplyPolicy
    mov [eff_tariff], ax

    ; --- Calculate duty = dcl_value * eff_tariff / 10000 ---
    mov ax, [user_dcl_lo]
    mov dx, [user_dcl_hi]
    mov bx, [eff_tariff]
    call CalculateDuty      ; returns DX:AX
    mov [duty_lo], ax
    mov [duty_hi], dx

; -----------------------------------------------------------------------
; OUTPUT
; -----------------------------------------------------------------------
output:
    mov ah, 09h
    lea dx, msg_base
    int 21h
    mov ax, [base_tariff]
    call PrintTariffPercent

    mov ah, 09h
    lea dx, msg_eff
    int 21h
    mov ax, [eff_tariff]
    call PrintTariffPercent

    mov ah, 09h
    lea dx, msg_duty
    int 21h
    mov ax, [duty_lo]
    mov dx, [duty_hi]
    call print_decimal_32

    mov ah, 09h
    lea dx, crlf
    int 21h

    mov ah, 4Ch
    xor al, al
    int 21h

same_err:
    mov ah, 09h
    lea dx, msg_same
    int 21h
    jmp input_loop

; -----------------------------------------------------------------------
; FindTariff
;   Reads [user_imp], [user_exp], [user_cat]  (all 1-based)
;   Returns AX = tariff word
;
;   word_offset = (imp-1)*IMP_STRIDE + (exp-1)*CAT_COUNT + (cat-1)
; -----------------------------------------------------------------------
FindTariff proc near
    push bx
    push dx
    push si

    ; (imp-1) * IMP_STRIDE (80)
    mov al, [user_imp]
    xor ah, ah
    dec ax
    mov bx, IMP_STRIDE
    mul bx                  ; AX = (imp-1)*80
    mov si, ax

    ; (exp-1) * CAT_COUNT (8)
    mov al, [user_exp]
    xor ah, ah
    dec ax
    mov bx, CAT_COUNT
    mul bx                  ; AX = (exp-1)*8
    add si, ax

    ; + (cat-1)
    mov al, [user_cat]
    xor ah, ah
    dec ax
    add si, ax

    ; convert word index to byte offset
    shl si, 1

    ; read from table
    lea bx, TARIFF_TABLE
    mov ax, [bx+si]

    pop si
    pop dx
    pop bx
    ret
FindTariff endp

; -----------------------------------------------------------------------
; ApplyPolicy
;   Reads [base_tariff] and [user_cond]
;   Returns AX = effective tariff  (0 .. MAX_TARIFF)
; -----------------------------------------------------------------------
ApplyPolicy proc near
    mov ax, [base_tariff]
    mov bl, [user_cond]
    xor bh, bh

    cmp bx, 2
    je  ap_pref
    cmp bx, 3
    je  ap_pen
    jmp ap_cap              ; condition 1 = Normal, no change

ap_pref:
    sub ax, 500
    jnc ap_cap
    xor ax, ax              ; clamp to 0
    ret

ap_pen:
    add ax, 1000

ap_cap:
    cmp ax, MAX_TARIFF
    jbe ap_ok
    mov ax, MAX_TARIFF
ap_ok:
    ret
ApplyPolicy endp

; -----------------------------------------------------------------------
; CalculateDuty
;   INPUT:  DX:AX = 32-bit declared value
;           BX    = effective tariff (x100, e.g. 2560 = 25.60%)
;   OUTPUT: DX:AX = 32-bit duty
;
;   duty = (declared_value * tariff + 5000) / 10000
; -----------------------------------------------------------------------
CalculateDuty proc near
    push bx
    push cx
    push si
    push di

    mov si, ax          ; si = dcl_lo
    mov di, dx          ; di = dcl_hi

    ; lo * tariff
    mov ax, si
    mul bx              ; DX:AX = lo * tariff
    mov cx, ax          ; cx = product bits 0-15
    mov si, dx          ; si = product bits 16-31

    ; hi * tariff  (contributes at bit 16)
    mov ax, di
    mul bx              ; DX:AX = hi * tariff
    add si, ax          ; add into mid word
    adc dx, 0           ; carry (ignored for normal values)

    ; round: +5000  (for round-half-up on fractional duties)
    add cx, 5000
    adc si, 0

    ; divide SI:CX by 10000  (two-step chained: avoids overflow when SI >= 10000)
    ; DI is free here (dcl_hi no longer needed); use it instead of push/pop
    mov bx, 10000

    mov ax, si          ; step 1: high word / 10000
    xor dx, dx
    div bx              ; AX = duty_hi quotient, DX = remainder
    mov di, ax          ; save duty_hi in DI (was push ax)

    mov ax, cx          ; step 2: remainder:CX / 10000
    div bx              ; DX fed automatically from step 1; AX = duty_lo

    mov dx, di          ; DX = duty_hi (was pop dx)

    pop di
    pop si
    pop cx
    pop bx
    ret
CalculateDuty endp

; -----------------------------------------------------------------------
; PrintTariffPercent
;   INPUT: AX = tariff*100  (e.g. 2560 -> prints "25.60%")
; -----------------------------------------------------------------------
PrintTariffPercent proc near
    push ax
    push bx
    push cx
    push dx

    xor dx, dx
    mov cx, 100
    div cx              ; AX = integer part, DX = fractional
    mov bx, dx          ; save fractional in BX early (INT 21h clobbers AX/DX)

    call print_decimal  ; print integer part

    mov ah, 02h
    mov dl, '.'
    int 21h

    cmp bx, 10          ; leading zero if fractional < 10
    jae ptp_no_zero
    mov ah, 02h
    mov dl, '0'
    int 21h
ptp_no_zero:
    mov ax, bx          ; fractional into AX for print_decimal
    call print_decimal

    mov ah, 02h
    mov dl, '%'
    int 21h

    pop dx
    pop cx
    pop bx
    pop ax
    ret
PrintTariffPercent endp

; -----------------------------------------------------------------------
; print_decimal  -  16-bit unsigned AX to screen
; -----------------------------------------------------------------------
print_decimal proc near
    push ax
    push bx
    push cx
    push dx

    mov bx, 10
    xor cx, cx
pd_push:
    xor dx, dx
    div bx
    push dx
    inc cx
    or  ax, ax
    jnz pd_push
pd_pop:
    pop dx
    add dl, '0'
    mov ah, 02h
    int 21h
    loop pd_pop

    pop dx
    pop cx
    pop bx
    pop ax
    ret
print_decimal endp

; -----------------------------------------------------------------------
; print_decimal_32  -  DX:AX 32-bit unsigned to screen
; -----------------------------------------------------------------------
print_decimal_32 proc near
    push ax
    push bx
    push cx
    push dx
    push si
    push di

    mov si, ax
    mov di, dx

    or  si, di
    jnz p32_start
    mov ah, 02h
    mov dl, '0'
    int 21h
    jmp p32_done

p32_start:
    mov bx, 10
    xor cx, cx

p32_push:
    ; divide DI:SI by 10 (DI=hi, SI=lo)
    mov ax, di
    xor dx, dx
    div bx
    mov di, ax          ; new hi quotient
    mov ax, si
    div bx              ; DX fed from hi remainder automatically
    mov si, ax          ; new lo quotient
    push dx
    inc cx

    mov ax, di
    or  ax, si
    jnz p32_push

p32_pop:
    pop dx
    add dl, '0'
    mov ah, 02h
    int 21h
    loop p32_pop

p32_done:
    pop di
    pop si
    pop dx
    pop cx
    pop bx
    pop ax
    ret
print_decimal_32 endp

; -----------------------------------------------------------------------
; ReadRange10  -  prompt (DX set), read 1-10, return AL
; -----------------------------------------------------------------------
ReadRange10 proc near
    mov ah, 09h
    int 21h
    call GetInputVal
    jc  rr10_bad
    cmp ax, 1
    jb  rr10_bad
    cmp ax, 10
    ja  rr10_bad
    ret
rr10_bad:
    jmp bad_input
ReadRange10 endp

; -----------------------------------------------------------------------
; ReadRange8  -  prompt (DX set), read 1-8, return AL
; -----------------------------------------------------------------------
ReadRange8 proc near
    mov ah, 09h
    int 21h
    call GetInputVal
    jc  r8_bad
    cmp ax, 1
    jb  r8_bad
    cmp ax, 8
    ja  r8_bad
    ret
r8_bad:
    jmp bad_input
ReadRange8 endp

; -----------------------------------------------------------------------
; ReadRange3  -  prompt (DX set), read 1-3, return AL
; -----------------------------------------------------------------------
ReadRange3 proc near
    mov ah, 09h
    int 21h
    call GetInputVal
    jc  r3_bad
    cmp ax, 1
    jb  r3_bad
    cmp ax, 3
    ja  r3_bad
    ret
r3_bad:
    jmp bad_input
ReadRange3 endp

; -----------------------------------------------------------------------
; bad_input  -  print error and restart
; -----------------------------------------------------------------------
bad_input:
    mov ah, 09h
    lea dx, msg_bad
    int 21h
    jmp input_loop

; -----------------------------------------------------------------------
; GetInputVal
;   Reads digits until Enter.  Returns AX = value, CF=0.
;   CF=1 on empty or bad input.
; -----------------------------------------------------------------------
GetInputVal proc near
    push bx
    push cx

    xor bx, bx
    xor cx, cx

gv_loop:
    mov ah, 01h
    int 21h
    cmp al, 13
    je  gv_done
    sub al, '0'
    jb  gv_err
    cmp al, 9
    ja  gv_err

    xor ah, ah
    push ax
    mov ax, bx
    mov si, 10
    mul si
    pop bx
    add bx, ax
    xchg ax, bx
    mov bx, ax
    inc cx
    jmp gv_loop

gv_done:
    jcxz gv_err
    mov ax, bx
    clc
    jmp gv_exit
gv_err:
    stc
gv_exit:
    pop cx
    pop bx
    ret
GetInputVal endp

; -----------------------------------------------------------------------
; Read32
;   Prints prompt (DX set), reads decimal until Enter.
;   Returns DX:AX = 32-bit value, CF=0.
;   CF=1 on empty/bad input.
;   32-bit accumulator: SI (hi) : BX (lo)
; -----------------------------------------------------------------------
Read32 proc near
    push cx
    push si

    mov ah, 09h
    int 21h

    xor bx, bx
    xor si, si
    xor cx, cx

r32_loop:
    mov ah, 01h
    int 21h
    cmp al, 13
    je  r32_done
    sub al, '0'
    jb  r32_err
    cmp al, 9
    ja  r32_err
    xor ah, ah

    push ax             ; save digit

    ; SI:BX * 10
    mov ax, bx
    mov di, 10
    mul di              ; DX:AX = BX*10
    mov bx, ax
    push dx             ; carry

    mov ax, si
    mul di              ; DX:AX = SI*10
    pop dx
    add ax, dx
    mov si, ax          ; new hi

    pop ax              ; restore digit
    add bx, ax
    adc si, 0

    inc cx
    jmp r32_loop

r32_done:
    jcxz r32_err
    mov ax, bx
    mov dx, si
    clc
    jmp r32_exit
r32_err:
    stc
r32_exit:
    pop si
    pop cx
    ret
Read32 endp

; -----------------------------------------------------------------------
; ParseCmdLine
;   Reads the DOS command tail from PSP via ES:[80h].
;   Parses exactly 5 space-separated decimal tokens:
;       exporter  importer  category  declared_value  condition
;   Validates each value (same rules as interactive input).
;   On success: stores results into user_* variables, returns CF=0.
;   On failure (empty / too few args / out of range): returns CF=1
;       and the caller falls through to the interactive input loop.
;
;   Register use:  SI = scan pointer into ES command tail (PSP offset)
;                  BP = hi accumulator for 32-bit parse
;                  All others saved/restored.
; -----------------------------------------------------------------------
ParseCmdLine proc near
    push ax
    push bx
    push cx
    push dx
    push si
    push di
    push bp

    ; Check length byte at PSP:[80h]
    mov al, byte ptr es:[80h]
    or  al, al
    jz  pcl_fail                ; empty command tail → interactive

    mov si, 81h                 ; SI points to first char of command tail

    ; ── Token 1: exporter (1–10) ─────────────────────────────────────
    call pcl_skip_sp
    call pcl_parse16
    jc   pcl_fail
    cmp  ax, 1
    jb   pcl_fail
    cmp  ax, 10
    ja   pcl_fail
    mov  [user_exp], al

    ; ── Token 2: importer (1–10, ≠ exporter) ────────────────────────
    call pcl_skip_sp
    call pcl_parse16
    jc   pcl_fail
    cmp  ax, 1
    jb   pcl_fail
    cmp  ax, 10
    ja   pcl_fail
    mov  [user_imp], al

    mov  al, [user_exp]
    cmp  al, [user_imp]
    je   pcl_fail               ; same-party → fall back to interactive

    ; ── Token 3: category (1–8) ──────────────────────────────────────
    call pcl_skip_sp
    call pcl_parse16
    jc   pcl_fail
    cmp  ax, 1
    jb   pcl_fail
    cmp  ax, 8
    ja   pcl_fail
    mov  [user_cat], al

    ; ── Token 4: declared value (32-bit) ─────────────────────────────
    call pcl_skip_sp
    call pcl_parse32            ; returns DX:AX
    jc   pcl_fail
    mov  [user_dcl_lo], ax
    mov  [user_dcl_hi], dx

    ; ── Token 5: condition (1–3) ─────────────────────────────────────
    call pcl_skip_sp
    call pcl_parse16
    jc   pcl_fail
    cmp  ax, 1
    jb   pcl_fail
    cmp  ax, 3
    ja   pcl_fail
    mov  [user_cond], al

    clc                         ; success
    jmp  pcl_exit

pcl_fail:
    stc                         ; signal: use interactive input loop

pcl_exit:
    pop  bp
    pop  di
    pop  si
    pop  dx
    pop  cx
    pop  bx
    pop  ax
    ret
ParseCmdLine endp

; -----------------------------------------------------------------------
; pcl_skip_sp
;   Advances SI past any space characters in ES:[SI].
; -----------------------------------------------------------------------
pcl_skip_sp proc near
pss_loop:
    cmp  byte ptr es:[si], ' '
    jne  pss_done
    inc  si
    jmp  pss_loop
pss_done:
    ret
pcl_skip_sp endp

; -----------------------------------------------------------------------
; pcl_parse16
;   Parses an unsigned decimal integer from ES:[SI], advances SI.
;   Returns AX = value, CF=0 on success.
;   Returns CF=1 if no digit was found or a non-digit is encountered
;   before the first space/CR.
;   Registers saved: BX CX DI
; -----------------------------------------------------------------------
pcl_parse16 proc near
    push bx
    push cx
    push di

    xor  bx, bx             ; accumulator
    xor  di, di             ; digit count

pp16_loop:
    mov  al, byte ptr es:[si]
    cmp  al, 0Dh            ; CR = end of command tail
    je   pp16_done
    cmp  al, ' '            ; space = end of this token
    je   pp16_done
    sub  al, '0'
    jb   pp16_err
    cmp  al, 9
    ja   pp16_err
    xor  ah, ah             ; digit now in AX

    push ax                 ; save digit
    mov  ax, bx
    mov  cx, 10
    mul  cx                 ; DX:AX = accumulator * 10
    pop  bx                 ; BX = digit
    add  bx, ax             ; BX = old_accum*10 + digit

    inc  si
    inc  di
    jmp  pp16_loop

pp16_done:
    or   di, di
    jz   pp16_err           ; no digits seen
    mov  ax, bx
    clc
    jmp  pp16_exit

pp16_err:
    stc

pp16_exit:
    pop  di
    pop  cx
    pop  bx
    ret
pcl_parse16 endp

; -----------------------------------------------------------------------
; pcl_parse32
;   Parses an unsigned 32-bit decimal integer from ES:[SI], advances SI.
;   Returns DX:AX (DX=hi, AX=lo), CF=0 on success.
;   Returns CF=1 on error.
;
;   Accumulator: BP (hi word) : BX (lo word)
;   Registers saved: BX CX DI BP
;
;   32-bit multiply by 10:
;       Step 1:  BX * 10  →  DX:AX ;  new_BX = AX,  carry = DX (saved in CX)
;       Step 2:  BP * 10  →  DX:AX ;  new_BP = AX + carry
; -----------------------------------------------------------------------
pcl_parse32 proc near
    push bx
    push cx
    push di
    push bp

    xor  bx, bx             ; lo accumulator
    xor  bp, bp             ; hi accumulator
    xor  di, di             ; digit count

pp32_loop:
    mov  al, byte ptr es:[si]
    cmp  al, 0Dh
    je   pp32_done
    cmp  al, ' '
    je   pp32_done
    sub  al, '0'
    jb   pp32_err
    cmp  al, 9
    ja   pp32_err
    xor  ah, ah             ; digit in AX

    push ax                 ; save digit

    ; ---- BP:BX * 10 ----
    push di                 ; save count (DI) — CX is free for multiplier
    mov  di, 10

    mov  ax, bx
    mul  di                 ; DX:AX = BX * 10
    mov  bx, ax             ; new lo
    mov  cx, dx             ; carry from lo into CX

    mov  ax, bp
    mul  di                 ; DX:AX = BP * 10  (DX≈0 for sane values)
    add  ax, cx             ; + carry from lo step
    mov  bp, ax             ; new hi

    pop  di                 ; restore count

    pop  ax                 ; restore digit
    add  bx, ax
    adc  bp, 0

    inc  si
    inc  di
    jmp  pp32_loop

pp32_done:
    or   di, di
    jz   pp32_err           ; no digits
    mov  ax, bx
    mov  dx, bp
    clc
    jmp  pp32_exit

pp32_err:
    stc

pp32_exit:
    pop  bp
    pop  di
    pop  cx
    pop  bx
    ret
pcl_parse32 endp

end start